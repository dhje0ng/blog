import { redirect } from "next/navigation";
import { DEFAULT_ROUTE } from "@/lib/constants/routes";

export default function HomePage() {
  redirect(DEFAULT_ROUTE);
}
