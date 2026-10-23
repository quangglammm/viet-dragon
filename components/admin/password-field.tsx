"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  autoFocus?: boolean;
  placeholder?: string;
};

/** A password input for the dark auth card: lock icon, show/hide toggle, no browser-specific styling. */
export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  autoFocus = false,
  placeholder = "••••••••••••",
}: Readonly<PasswordFieldProps>) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-zinc-200">
        {label}
      </label>
      <div className="relative flex items-center">
        <Lock size={16} className="absolute left-3.5 text-zinc-400" aria-hidden />
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
          className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-10 pr-10 text-xs font-semibold text-white placeholder-zinc-500 transition-all focus:border-brand-primary focus:bg-white/10 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/30"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-3.5 text-zinc-400 transition-colors hover:text-white cursor-pointer"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
