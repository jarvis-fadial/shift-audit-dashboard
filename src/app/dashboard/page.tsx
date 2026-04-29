import { WorkloadDashboard } from "@/components/workload-dashboard"
import data from "./workload-data.json"

export default function Page() {
  return <WorkloadDashboard data={data} />
}
