import { mock, type Mock } from "bun:test";
import type { Session } from "next-auth";
import { createAdminNavigationMock } from "./navigation";
import { ADMIN_ROUTES } from "@/lib/routes";

type Query = Mock<(...args: unknown[]) => Promise<unknown>>;
export function installAdminPageMocks(pathname: string = ADMIN_ROUTES.home) {
  mock.module("server-only", () => ({}));
  const session: Session = {
    user: {
      id: "admin-ui-test",
      name: "Operator Uji",
      email: "operator@example.test",
      role: "ADMIN",
      roles: ["ADMIN"],
    },
    expires: "2027-01-01T00:00:00Z",
  };
  const getSession = mock(async (): Promise<Session | null> => session);
  mock.module("@/auth", () => ({
    auth: getSession,
    signIn: mock(),
    signOut: mock(),
    handlers: {},
    unstable_update: mock(),
  }));
  const queries = new Map<string, Query>();
  const query = (model: string, operation: string) => {
    const key = model + "." + operation;
    let fn = queries.get(key);
    if (!fn) {
      fn = mock(async (...args: unknown[]): Promise<unknown> => {
        void args;
        return operation === "count"
          ? 0
          : operation === "aggregate"
            ? { _sum: { total: 0 } }
            : operation === "findUnique" || operation === "findFirst"
              ? null
              : [];
      });
      queries.set(key, fn);
    }
    return fn;
  };
  const prisma = new Proxy<Record<string, unknown>>(
    {},
    {
      get: (_target, model) =>
        new Proxy<Record<string, unknown>>(
          {},
          {
            get: (_model, operation) => query(String(model), String(operation)),
          }
        ),
    }
  );
  mock.module("@/lib/prisma", () => ({ prisma }));
  const navigation = createAdminNavigationMock({ pathname: () => pathname });
  mock.module("next/navigation", () => navigation);
  return { session, getSession, query, navigation };
}
