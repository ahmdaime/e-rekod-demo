import { DEMO_STUDENT_ICS } from "@/data/demoData";
import AnakDashboardClient from "./AnakDashboardClient";

// Required for static export with dynamic routes
// Generate both formats: with dashes (140115-00-0123) and without (140115000123)
export function generateStaticParams() {
  return DEMO_STUDENT_ICS.flatMap((ic) => [
    { ic },
    { ic: ic.replace(/-/g, "") },
  ]);
}

export default function AnakPage() {
  return <AnakDashboardClient />;
}
