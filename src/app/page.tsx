import { LandingPage } from "@/components/landing-page"
import data from "./dashboard/workload-data.json"

export default function Home() {
  return <LandingPage staff={data.staff} />
}
