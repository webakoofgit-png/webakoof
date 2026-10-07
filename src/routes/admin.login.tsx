import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/components/admin/layout";
export const Route = createFileRoute("/admin/login")({ component: Login });
