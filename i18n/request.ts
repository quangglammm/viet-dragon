import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { getMessages } from "@/lib/content/read/load";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // The files' texts with the published UI copy of the content database laid over them (cached; rebuilt by a UI-copy publish).
  return { locale, messages: await getMessages(locale) };
});
