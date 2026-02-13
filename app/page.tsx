import { redirect } from "next/navigation";
import { DEFAULT_ROUTE } from "@/lib/routes";

export default function HomePage() {
  redirect(DEFAULT_ROUTE);
}
