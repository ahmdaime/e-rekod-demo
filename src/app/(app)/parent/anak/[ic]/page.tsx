import { DEMO_STUDENT_ICS } from "@/data/demoData";
import AnakDashboardClient from "./AnakDashboardClient";

// Required for static export with dynamic routes
export function generateStaticParams() {
  return DEMO_STUDENT_ICS.map((ic) => ({ ic }));
}

export default function AnakPage() {
  return <AnakDashboardClient />;
}
