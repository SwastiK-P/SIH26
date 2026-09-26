import { Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "@/components/AppShell"
import { Dashboard } from "@/pages/Dashboard"
import { NetworkExplorer } from "@/pages/NetworkExplorer"
import { Entities } from "@/pages/Entities"
import { EntityProfile } from "@/pages/EntityProfile"
import { Cases } from "@/pages/Cases"
import { CaseDetail } from "@/pages/CaseDetail"
import { Timeline } from "@/pages/Timeline"
import { Alerts } from "@/pages/Alerts"
import { Ingest } from "@/pages/Ingest"
import { Assistant } from "@/pages/Assistant"

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="network" element={<NetworkExplorer />} />
        <Route path="entities" element={<Entities />} />
        <Route path="entities/:id" element={<EntityProfile />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/:id" element={<CaseDetail />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="ingest" element={<Ingest />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
