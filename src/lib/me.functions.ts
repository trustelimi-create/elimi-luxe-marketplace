import { createServerFn } from "@tanstack/react-start";

export const getMyRoles = createServerFn({ method: "POST" }).handler(async () => {
  const { requireUser, getRoles } = await import("@/lib/auth-helpers.server");
  const user = await requireUser();
  const roles = await getRoles(user.id);
  return { roles, userId: user.id };
});
