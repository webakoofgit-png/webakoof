import { createContext, useContext } from "react";
import type { PublicContent } from "./public";
export const ContentContext = createContext<PublicContent | null>(null);
export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error("Public content provider missing");
  return value;
}
