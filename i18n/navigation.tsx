import { useMemo, forwardRef, type ComponentProps } from "react";
import { useLocale } from "next-intl";
import { createNavigation } from "next-intl/navigation";
import { localizePath, toInternalPath, type RouteLocale } from "@/lib/routes";
import { routing } from "./routing";

// next-intl's navigation API with the URL words of the public site on top (lib/routes.ts). Everything in the app speaks INTERNAL paths —
// `/products/<category>/<product>`, `/blog/<post>` — and these wrappers write them as the page's language does (`/san-pham/…` in Vietnamese)
// on the way out and read them back on the way in, so models, builders and the active-menu logic never see a localized word.
// (next-intl's own `pathnames` option only localizes a template plus params, redirects with a 307 and reports the template from
// `usePathname()`, none of which fits slug-based links and a permanent move.)

const navigation = createNavigation(routing);

type LinkProps = ComponentProps<typeof navigation.Link>;

const localizeHref = (locale: RouteLocale, href: LinkProps["href"]): LinkProps["href"] => {
  if (typeof href === "string") return localizePath(locale, href);
  return typeof href.pathname === "string" ? { ...href, pathname: localizePath(locale, href.pathname) } : href;
};

/** Link to an internal path; the language is the page's, or `locale` when the link switches language. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ href, locale, ...rest }, ref) {
  const current = useLocale() as RouteLocale;
  return <navigation.Link ref={ref} href={localizeHref((locale ?? current) as RouteLocale, href)} locale={locale} {...rest} />;
});

type PathnameArgs = Parameters<typeof navigation.getPathname>[0];
type RedirectArgs = Parameters<typeof navigation.redirect>[0];

const localizeArgs = <A extends PathnameArgs | RedirectArgs>(args: A): A => (typeof args.href === "string" ? { ...args, href: localizePath(args.locale as RouteLocale, args.href) } : args);

export const getPathname = (args: PathnameArgs): string => navigation.getPathname(localizeArgs(args));
export const redirect = (args: RedirectArgs, type?: Parameters<typeof navigation.redirect>[1]): never => navigation.redirect(localizeArgs(args), type);
export const permanentRedirect = (args: RedirectArgs, type?: Parameters<typeof navigation.permanentRedirect>[1]): never => navigation.permanentRedirect(localizeArgs(args), type);

/** The current path in INTERNAL form (`/products/…`, never `/san-pham/…`), without the language prefix. */
export function usePathname(): string {
  return toInternalPath(navigation.usePathname());
}

/** next-intl's router; `push` / `replace` / `prefetch` take an internal path and write it in the language the navigation lands in. */
export function useRouter() {
  const router = navigation.useRouter();
  const current = useLocale() as RouteLocale;
  return useMemo(() => {
    type Options = Parameters<typeof router.push>[1];
    const localized = (href: string, options?: Options) => localizePath((options?.locale ?? current) as RouteLocale, href);
    return {
      ...router,
      push: (href: string, options?: Options) => router.push(localized(href, options), options),
      replace: (href: string, options?: Options) => router.replace(localized(href, options), options),
      prefetch: (href: string, options?: Parameters<typeof router.prefetch>[1]) => router.prefetch(localizePath((options?.locale ?? current) as RouteLocale, href), options),
    };
  }, [router, current]);
}
