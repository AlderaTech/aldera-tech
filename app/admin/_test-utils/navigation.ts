import { mock } from "bun:test";
import { ADMIN_ROUTES } from "@/lib/routes";

export function createAdminNavigationMock({
  pathname = () => ADMIN_ROUTES.home,
  query = () => "",
}: { pathname?: () => string; query?: () => string } = {}) {
  const router = {
    push: mock(),
    replace: mock(),
    refresh: mock(),
    prefetch: mock(),
    back: mock(),
    forward: mock(),
  };
  const redirect = mock((url: string): never => {
    throw new Error("redirect:" + url);
  });
  const notFound = mock((): never => {
    throw new Error("notFound");
  });
  return {
    usePathname: pathname,
    useSearchParams: () => new URLSearchParams(query()),
    useRouter: () => router,
    redirect,
    notFound,
    permanentRedirect: redirect,
    useParams: () => ({}),
    useSelectedLayoutSegment: () => null,
    useSelectedLayoutSegments: () => [],
  };
}
