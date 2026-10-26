"use client";

// A field no visitor ever sees and so never fills: a script that fills every input it finds gives itself away, and the server answers it as if it had
// succeeded and sends nothing (lib/consult/schema.ts). The danger is the opposite mistake — a REAL customer's browser filling it — so it is kept out of
// reach of autofill: a name no address profile has, `autocomplete="off"`, the password managers' opt-outs, out of the tab order and hidden from assistive technology.

type HoneypotFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function HoneypotField({ value, onChange }: Readonly<HoneypotFieldProps>) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0">
      <label>
        Leave this field empty
        <input
          type="text"
          name="vd-trap-7f3a"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
        />
      </label>
    </div>
  );
}
