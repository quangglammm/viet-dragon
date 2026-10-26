import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildLeadEmail } from "@/lib/consult/email";
import { CONSULT_MESSAGES, MAX_CONSULT_BODY_BYTES, parseConsult } from "@/lib/consult/schema";
import { getDb } from "@/lib/db";
import { getMailEnv, getSiteEnv } from "@/lib/env";
import { BodyTooLarge, readBodyCapped } from "@/lib/http/body";
import { getLogger, maskPhone } from "@/lib/logger";
import { clientAddress, consumeLimit, digest, pruneLimits, tooManyRequests, type Limit, type LimitResult } from "@/lib/rate-limit";

// The consult form's endpoint: a visitor leaves a phone number, the shop owner gets an email. It is public and sends mail, so it is the place a
// stranger can do the most harm: it caps the body, validates and cleans every field (lib/consult/schema.ts), escapes everything that goes into the
// email (lib/consult/email.ts), answers a honeypot like a success, and limits how often one address, one number and the whole site may ask.

const log = getLogger("consult");

const SMTPS_PORT = 465;
const MINUTE = 60;
const HOUR = 60 * MINUTE;

// 5 a customer would never reach; a shared mobile-carrier address still has room. Together they bound the mail this form can make to the owner.
const LIMITS = {
  ip: { purpose: "consult-ip", windowSeconds: 10 * MINUTE, max: 5 },
  phone: { purpose: "consult-phone", windowSeconds: HOUR, max: 3 },
  overall: { purpose: "consult-all", windowSeconds: HOUR, max: 100 },
} as const;

/**
 * Counts a request against a limit. If the database cannot be asked (an outage), the request is let through and the failure logged: a lost lead
 * costs the shop more than a few extra requests during an outage cost anyone.
 */
async function consume(limit: Omit<Limit, "subject">, subject: string): Promise<LimitResult> {
  try {
    return await consumeLimit(getDb(), { ...limit, subject });
  } catch (error) {
    log.error({ err: error, limit: limit.purpose }, "rate limit unavailable: letting the request through");
    return { allowed: true, count: 0, retryAfterSeconds: 1 };
  }
}

const refusal = (message: string, code: string, status: number) => NextResponse.json({ error: message, code }, { status });

export async function POST(req: Request) {
  try {
    const mail = getMailEnv();
    const { SITE_URL } = getSiteEnv();

    // The address is counted first, whatever the request turns out to be: a bot that sends junk is limited like one that sends leads.
    const byAddress = await consume(LIMITS.ip, clientAddress(req.headers));
    if (!byAddress.allowed) return tooManyRequests(byAddress, CONSULT_MESSAGES.rateLimited);
    void pruneLimits(getDb()).catch(() => undefined);

    let raw: Uint8Array;
    try {
      raw = await readBodyCapped(req, MAX_CONSULT_BODY_BYTES);
    } catch (error) {
      if (error instanceof BodyTooLarge) return refusal(CONSULT_MESSAGES.tooLarge, "PAYLOAD_TOO_LARGE", 413);
      throw error;
    }
    let body: unknown;
    try {
      body = JSON.parse(new TextDecoder().decode(raw));
    } catch {
      return refusal(CONSULT_MESSAGES.invalid, "INVALID_JSON", 400);
    }

    const parsed = parseConsult(body, SITE_URL);
    if (parsed.kind === "invalid") return refusal(parsed.message, "INVALID", 400);
    if (parsed.kind === "honeypot") {
      log.info("consult form answered as a success without sending: the honeypot field was filled");
      return NextResponse.json({ success: true, message: "Yêu cầu tư vấn đã được gửi thành công!" });
    }
    const { lead } = parsed;

    const byPhone = await consume(LIMITS.phone, digest(lead.phone));
    if (!byPhone.allowed) return tooManyRequests(byPhone, CONSULT_MESSAGES.rateLimited);
    const overall = await consume(LIMITS.overall, "all");
    if (!overall.allowed) {
      log.warn({ count: overall.count }, "consult form: the site-wide hourly limit is reached");
      return tooManyRequests(overall, CONSULT_MESSAGES.rateLimited);
    }

    const email = buildLeadEmail(lead, { siteOrigin: SITE_URL, receiver: mail.CONSULT_RECEIVER_EMAIL });

    // SMTP is only guaranteed in production (lib/env.ts); elsewhere an unset one just logs the lead.
    const { SMTP_HOST: smtpHost, SMTP_USER: smtpUser, SMTP_PASS: smtpPass } = mail;
    if (smtpHost && smtpUser && smtpPass) {
      const port = mail.SMTP_PORT;
      const transporter = nodemailer.createTransport({ host: smtpHost, port, secure: mail.SMTP_SECURE || port === SMTPS_PORT, auth: { user: smtpUser, pass: smtpPass } });
      await transporter.sendMail({
        from: mail.SMTP_FROM ?? `"Viet Dragon Web" <${smtpUser}>`,
        to: mail.CONSULT_RECEIVER_EMAIL,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
    } else {
      // The phone is masked: the subject and Zalo link embed the full number, so they are omitted.
      log.info({ to: mail.CONSULT_RECEIVER_EMAIL, phone: maskPhone(lead.phone), productName: lead.productName, materialName: lead.materialName }, "consult lead not emailed: SMTP is not configured");
    }

    return NextResponse.json({ success: true, message: "Yêu cầu tư vấn đã được gửi thành công!", zaloChatLink: email.zaloChatLink });
  } catch (error) {
    log.error({ err: error }, "consult submission failed");
    return refusal("Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.", "ERROR", 500);
  }
}
