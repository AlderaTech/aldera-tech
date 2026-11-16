import { PUBLIC_ROUTES } from "@/lib/routes";

export function usesStudioPublicChrome(pathname: string): boolean {
  const routes: readonly string[] = [
    PUBLIC_ROUTES.home,
    PUBLIC_ROUTES.about,
    PUBLIC_ROUTES.services,
    PUBLIC_ROUTES.aiRelay,
    PUBLIC_ROUTES.pricing,
    PUBLIC_ROUTES.contact,
    PUBLIC_ROUTES.faq,
    PUBLIC_ROUTES.testimonials,
    PUBLIC_ROUTES.portfolio,
    PUBLIC_ROUTES.blog,
  ];
  return (
    routes.includes(pathname) ||
    pathname.startsWith(`${PUBLIC_ROUTES.portfolio}/`) ||
    pathname.startsWith(`${PUBLIC_ROUTES.blog}/`)
  );
}
