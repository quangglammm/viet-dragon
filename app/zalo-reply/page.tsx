"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, Copy, Check, ExternalLink } from "lucide-react";
import { ZaloIcon } from "@/components/ui/zalo-icon";

function ZaloReplyContent() {
  const searchParams = useSearchParams();
  const rawPhone = searchParams.get("phone") ?? "";
  const product = searchParams.get("product") ?? "Sản phẩm";
  const material = searchParams.get("material") ?? "";
  const customMsg = searchParams.get("msg");

  const productLabel = material ? `${product} ${material}` : product;
  const defaultMsg = `Cảm ơn anh/chị đã quan tâm đến sản phẩm ${productLabel}. Vietdragon rất mong muốn được liên hệ để tư vấn chi tiết hơn về mong đợi, chất liệu, giá thành và kích thước phù hợp nhất cho nhu cầu của mình ạ!`;
  const message = customMsg ?? defaultMsg;

  const [copied, setCopied] = useState(false);
  const [openedZalo, setOpenedZalo] = useState(false);

  // Normalize phone for Zalo: 098... -> 8498...
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const zaloPhone = cleanPhone.startsWith("84")
    ? cleanPhone
    : cleanPhone.startsWith("0")
    ? `84${cleanPhone.slice(1)}`
    : `84${cleanPhone}`;
  const displayPhone = cleanPhone.startsWith("84")
    ? `0${cleanPhone.slice(2)}`
    : cleanPhone;

  const zaloUrl = `https://zalo.me/${zaloPhone}`;

  // Automatically copy message and attempt to open Zalo
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(message)
        .then(() => setCopied(true))
        .catch(() => {});
    }

    // Auto open Zalo after small delay
    const timer = window.setTimeout(() => {
      if (zaloPhone) {
        setOpenedZalo(true);
        window.location.href = zaloUrl;
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [message, zaloPhone, zaloUrl]);

  const handleManualCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(message).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f5ff] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-zinc-100 p-7 sm:p-8 flex flex-col items-center text-center">
        {/* Zalo Icon */}
        <div className="size-16 rounded-2xl bg-[#0068ff]/10 flex items-center justify-center mb-4">
          <ZaloIcon className="size-11" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-[#7000fe] bg-brand-soft px-3 py-1 rounded-full mb-2">
          Viet Dragon Chat Bridge
        </span>

        <h1 className="text-xl sm:text-2xl font-black text-zinc-900 leading-snug">
          Đang chuyển tiếp tới Zalo
        </h1>

        <p className="text-sm font-semibold text-[#0068ff] mt-1 mb-4">
          Khách hàng: {displayPhone || rawPhone} &bull; {product}
        </p>

        {/* Copy Status Badge */}
        <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 flex items-center gap-3 text-left">
          <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-900">
              Đã tự động sao chép tin nhắn phản hồi!
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Khi khung chat Zalo mở lên, bạn chỉ cần nhấn <strong>Ctrl + V (Dán)</strong> và bấm <strong>Gửi</strong>.
            </p>
          </div>
        </div>

        {/* Message preview card */}
        <div className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
              Nội dung tin nhắn sẵn sàng gửi:
            </span>
            <button
              type="button"
              onClick={handleManualCopy}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0068ff] hover:underline cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={13} />
                  <span>Đã chép</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Chép lại</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-700 leading-relaxed italic bg-white p-3 rounded-xl border border-zinc-100">
            &ldquo;{message}&rdquo;
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 px-5 rounded-xl bg-[#0068ff] hover:bg-[#0057d6] text-white font-bold text-sm shadow-md shadow-[#0068ff]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle size={18} />
            <span>{openedZalo ? "Mở lại ứng dụng Zalo" : "Mở Zalo ngay"}</span>
            <ExternalLink size={14} />
          </a>

          <button
            type="button"
            onClick={handleManualCopy}
            className="py-3.5 px-5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Copy size={16} />
            <span>Sao chép tin</span>
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 mt-5">
          Nếu Zalo không tự động mở, vui lòng bấm vào nút <strong>&ldquo;Mở Zalo ngay&rdquo;</strong> ở trên.
        </p>
      </div>
    </div>
  );
}

export default function ZaloReplyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-sm text-zinc-500 font-medium">
          Đang chuẩn bị kết nối Zalo...
        </div>
      }
    >
      <ZaloReplyContent />
    </Suspense>
  );
}
