// A Vietnamese mobile number as the consult forms take it: 10 digits starting 03x / 05x / 07x / 08x / 09x, or the same with +84 and no leading 0.
// ONE definition for the browser forms and the server — the forms use it to answer at once, the server because it never trusts the forms.
// Import-free so the browser bundle can share it.

export const PHONE_PATTERN = /^(0|\+84)[35789][0-9]{8}$/;

/** What the number looks like with the separators people type (spaces, dots, dashes) taken out. */
export const cleanPhone = (value: string): string => value.trim().replace(/[\s.-]/g, "");

export const isPhoneNumber = (value: string): boolean => PHONE_PATTERN.test(cleanPhone(value));

/** `0901448377` / `+84901448377` → `84901448377`, the form zalo.me and the Zalo bridge page use. */
export function zaloNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("84")) return digits;
  return digits.startsWith("0") ? `84${digits.slice(1)}` : `84${digits}`;
}
