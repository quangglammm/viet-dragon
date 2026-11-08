"use client";

import { Notice } from "@/components/admin/notice";
import { reauthenticate } from "@/lib/auth-client";
import type { AuthFailure } from "@/lib/auth/error-messages";

type FailureNoticeProps = { failure: AuthFailure; className?: string };

/** An error from an auth call; when the session is too old for the action it offers to sign in again. */
export function FailureNotice({ failure, className }: Readonly<FailureNoticeProps>) {
  return (
    <Notice tone="error" className={className}>
      {failure.message}
      {failure.needsReauth && (
        <button type="button" onClick={() => void reauthenticate()} className="mt-2 block font-bold underline cursor-pointer">
          Đăng nhập lại
        </button>
      )}
    </Notice>
  );
}
