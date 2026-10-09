import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { CONTACT_EMAIL } from "@/lib/contact";

const PHONE_REGEX = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
const TARGET_EMAIL = process.env.CONSULT_RECEIVER_EMAIL ?? CONTACT_EMAIL;

interface ConsultPayload {
  phone: string;
  productName: string;
  materialName?: string;
  sizeLabel?: string;
  sizeDims?: string;
  productUrl?: string;
}

function formatZaloPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("84")) return digits;
  if (digits.startsWith("0")) return `84${digits.slice(1)}`;
  return `84${digits}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ConsultPayload>;
    const phone = body.phone?.trim() ?? "";
    const productName = body.productName?.trim() ?? "Sản phẩm Viet Dragon";
    const materialName = body.materialName?.trim() ?? "";
    const sizeLabel = body.sizeLabel?.trim() ?? "";
    const sizeDims = body.sizeDims?.trim() ?? "";
    const productUrl = body.productUrl?.trim() ?? "";

    const cleanedPhone = phone.replace(/[\s.-]/g, "");
    if (!PHONE_REGEX.test(cleanedPhone)) {
      return NextResponse.json(
        { error: "Số điện thoại không hợp lệ" },
        { status: 400 }
      );
    }

    const zaloPhone = formatZaloPhone(cleanedPhone);
    const zaloChatLink = `https://zalo.me/${zaloPhone}`;

    // Host origin for smart Zalo bridge page (auto-copies response message and opens Zalo)
    let siteOrigin = "https://vietdragon.vn";
    try {
      if (productUrl) {
        siteOrigin = new URL(productUrl).origin;
      } else {
        const headerOrigin = req.headers.get("origin");
        if (headerOrigin) siteOrigin = headerOrigin;
      }
    } catch {
      // Fallback to default
    }
    const materialParam = materialName ? `&material=${encodeURIComponent(materialName)}` : "";
    const smartBridgeLink = `${siteOrigin}/zalo-reply?phone=${zaloPhone}&product=${encodeURIComponent(productName)}${materialParam}`;

    const emailSubject = `[Gấp] ${phone} quan tâm sản phẩm ${productName}`;
    const productLabel = materialName ? `${productName} ${materialName}` : productName;
    const consultQuote = `Cảm ơn anh/chị đã quan tâm đến sản phẩm ${productLabel}. Vietdragon rất mong muốn được liên hệ để tư vấn chi tiết hơn về mong đợi, chất liệu, giá thành và kích thước phù hợp nhất cho nhu cầu của mình ạ!`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
    <!-- Header -->
    <tr>
      <td style="padding: 24px 32px; background: linear-gradient(135deg, #7000fe 0%, #ae34e8 100%); text-align: left;">
        <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.15em; color: rgba(255, 255, 255, 0.85); text-transform: uppercase;">VIET DRAGON PRINTING</span>
        <h1 style="margin: 6px 0 0; font-size: 20px; font-weight: 800; color: #ffffff;">Yêu Cầu Tư Vấn Khách Hàng Mới</h1>
      </td>
    </tr>

    <!-- Customer Phone Card -->
    <tr>
      <td style="padding: 28px 32px 16px;">
        <div style="background-color: #f1f5f9; border-radius: 12px; padding: 18px 20px; border-left: 4px solid #0068ff;">
          <p style="margin: 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Số điện thoại khách hàng</p>
          <p style="margin: 6px 0 0; font-size: 24px; font-weight: 900; color: #0068ff; letter-spacing: 0.02em;">${phone}</p>
        </div>
      </td>
    </tr>

    <!-- Action Link (Nhắn tin qua Zalo) -->
    <tr>
      <td style="padding: 0 32px 24px; text-align: center;">
        <a href="${smartBridgeLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0068ff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 14px rgba(0, 104, 255, 0.35);">
          💬 ${phone} Nhắn tin qua Zalo
        </a>
        <p style="margin: 8px 0 0; font-size: 12px; color: #64748b;">
          (Tự động sao chép sẵn lời chào tư vấn và mở ứng dụng Zalo chat ngay với khách hàng)
        </p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8;">
          Hoặc mở link Zalo trực tiếp: <a href="${zaloChatLink}" target="_blank" rel="noopener noreferrer" style="color: #0068ff;">${zaloChatLink}</a>
        </p>
      </td>
    </tr>

    <!-- Product Details -->
    <tr>
      <td style="padding: 0 32px 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 130px; font-weight: 600;">Sản phẩm:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 800; color: #09052f;">${productName}</td>
          </tr>
          ${materialName ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Chất liệu:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #334155;">${materialName}</td>
          </tr>` : ""}
          ${sizeLabel ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Quy cách / Kích thước:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #334155;">${sizeLabel}${sizeDims && !sizeLabel.includes(sizeDims) ? ` (${sizeDims})` : ""}</td>
          </tr>` : ""}
          ${productUrl ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Link sản phẩm:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0068ff;"><a href="${productUrl}" style="color: #0068ff; word-break: break-all;">${productUrl}</a></td>
          </tr>` : ""}
        </table>
      </td>
    </tr>

    <!-- Suggested consult quote -->
    <tr>
      <td style="padding: 0 32px 28px;">
        <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-left: 4px solid #7000fe; border-radius: 10px; padding: 16px 18px;">
          <p style="margin: 0; font-size: 11px; font-weight: 800; color: #7000fe; text-transform: uppercase; letter-spacing: 0.05em;">Nội dung phản hồi đề xuất cho khách:</p>
          <p style="margin: 8px 0 0; font-size: 13.5px; line-height: 1.6; color: #374151; font-style: italic;">
            &ldquo;${consultQuote}&rdquo;
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
        Email thông báo tự động từ Website <strong>vietdragon.vn</strong> tới <strong>${TARGET_EMAIL}</strong>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Check if SMTP environment variables are configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      const port = Number(process.env.SMTP_PORT ?? 587);
      const secure = process.env.SMTP_SECURE === "true" || port === 465;

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? `"Viet Dragon Web" <${smtpUser}>`,
        to: TARGET_EMAIL,
        subject: emailSubject,
        text: `Số điện thoại: ${phone}\nNhắn tin qua Zalo: ${zaloChatLink}\nSản phẩm: ${productName}\n${consultQuote}`,
        html: htmlContent,
      });
    } else {
      // In development or when SMTP is not configured, log the email details
      console.info("[CONSULT REQUEST - SIMULATED EMAIL DISPATCH]", {
        to: TARGET_EMAIL,
        subject: emailSubject,
        phone,
        productName,
        materialName,
        zaloChatLink,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Yêu cầu tư vấn đã được gửi thành công!",
      zaloChatLink,
    });
  } catch (error) {
    console.error("Consult API Error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
