import type { Lead } from "./schema";
import { zaloNumber } from "@/lib/phone";

// The notification the shop owner gets for a consult lead. Every value that came from the visitor is escaped before it goes into the HTML, put in
// the subject on ONE line, or percent-encoded in a URL — the visitor is anonymous and this mail is read by someone who will click its buttons.
// The Zalo bridge button points at THIS site (`siteOrigin`, from SITE_URL): never at an origin the request names.

const AMPERSAND = /&/g;
const LESS_THAN = /</g;
const GREATER_THAN = />/g;
const DOUBLE_QUOTE = /"/g;
const SINGLE_QUOTE = /'/g;

/** For text and attribute values in HTML. */
export const escapeHtml = (value: string): string =>
  value.replace(AMPERSAND, "&amp;").replace(LESS_THAN, "&lt;").replace(GREATER_THAN, "&gt;").replace(DOUBLE_QUOTE, "&quot;").replace(SINGLE_QUOTE, "&#39;");

export interface LeadEmail {
  subject: string;
  text: string;
  html: string;
  zaloChatLink: string;
  bridgeLink: string;
}

export function buildLeadEmail(lead: Lead, { siteOrigin, receiver }: { siteOrigin: string; receiver: string }): LeadEmail {
  const e = escapeHtml;
  const zaloPhone = zaloNumber(lead.phone);
  const zaloChatLink = `https://zalo.me/${zaloPhone}`;
  const materialParam = lead.materialName ? `&material=${encodeURIComponent(lead.materialName)}` : "";
  const bridgeLink = `${siteOrigin}/zalo-reply?phone=${zaloPhone}&product=${encodeURIComponent(lead.productName)}${materialParam}`;

  const subject = `[Gấp] ${lead.phone} quan tâm sản phẩm ${lead.productName}`;
  const productLabel = lead.materialName ? `${lead.productName} ${lead.materialName}` : lead.productName;
  const consultQuote = `Cảm ơn anh/chị đã quan tâm đến sản phẩm ${productLabel}. Vietdragon rất mong muốn được liên hệ để tư vấn chi tiết hơn về mong đợi, chất liệu, giá thành và kích thước phù hợp nhất cho nhu cầu của mình ạ!`;
  const sizeText = lead.sizeLabel ? `${lead.sizeLabel}${lead.sizeDims && !lead.sizeLabel.includes(lead.sizeDims) ? ` (${lead.sizeDims})` : ""}` : "";

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${e(subject)}</title>
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
          <p style="margin: 6px 0 0; font-size: 24px; font-weight: 900; color: #0068ff; letter-spacing: 0.02em;">${e(lead.phone)}</p>
        </div>
      </td>
    </tr>

    <!-- Action Link (Nhắn tin qua Zalo) -->
    <tr>
      <td style="padding: 0 32px 24px; text-align: center;">
        <a href="${e(bridgeLink)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0068ff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 14px rgba(0, 104, 255, 0.35);">
          💬 ${e(lead.phone)} Nhắn tin qua Zalo
        </a>
        <p style="margin: 8px 0 0; font-size: 12px; color: #64748b;">
          (Tự động sao chép sẵn lời chào tư vấn và mở ứng dụng Zalo chat ngay với khách hàng)
        </p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8;">
          Hoặc mở link Zalo trực tiếp: <a href="${e(zaloChatLink)}" target="_blank" rel="noopener noreferrer" style="color: #0068ff;">${e(zaloChatLink)}</a>
        </p>
      </td>
    </tr>

    <!-- Product Details -->
    <tr>
      <td style="padding: 0 32px 24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 130px; font-weight: 600;">Sản phẩm:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 800; color: #09052f;">${e(lead.productName)}</td>
          </tr>
          ${lead.materialName ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Chất liệu:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #334155;">${e(lead.materialName)}</td>
          </tr>` : ""}
          ${lead.sizeLabel ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Quy cách / Kích thước:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #334155;">${e(sizeText)}</td>
          </tr>` : ""}
          ${lead.productUrl ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Link sản phẩm:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0068ff;"><a href="${e(lead.productUrl ?? "")}" style="color: #0068ff; word-break: break-all;">${e(lead.productUrl ?? "")}</a></td>
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
            &ldquo;${e(consultQuote)}&rdquo;
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
        Email thông báo tự động từ Website <strong>vietdragon.vn</strong> tới <strong>${e(receiver)}</strong>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

  const text = `Số điện thoại: ${lead.phone}\nNhắn tin qua Zalo: ${zaloChatLink}\nSản phẩm: ${lead.productName}\n${consultQuote}`;
  return { subject, text, html, zaloChatLink, bridgeLink };
}
