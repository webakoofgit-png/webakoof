import { createServerFn } from "@tanstack/react-start";
export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const [{ getRequest, setResponseHeader }, { currentAdmin }] = await Promise.all([
    import("@tanstack/react-start/server"),
    import("./security.server"),
  ]);
  setResponseHeader("Cache-Control", "no-store");
  return currentAdmin(getRequest());
});
