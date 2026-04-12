import { Routes, Route } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"
import { LoginPage } from "@/pages/LoginPage"
import { HomePage } from "@/pages/HomePage"
import { AssumptionSetsPage } from "@/pages/AssumptionSetsPage"
import { LoansPage } from "@/pages/LoansPage"
import { PropertiesPage } from "@/pages/PropertiesPage"
import { AnalysesPage } from "@/pages/AnalysesPage"
import { NeighborhoodsPage } from "@/pages/NeighborhoodsPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { AccountPage } from "@/pages/AccountPage"
import { BillingPage } from "@/pages/BillingPage"
import { NotificationsPage } from "@/pages/NotificationsPage"
import { ProtectedRoute } from "@/components/ProtectedRoute"

function Protected({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Protected><HomePage /></Protected>} />
        <Route path="/assumption-sets" element={<Protected><AssumptionSetsPage /></Protected>} />
        <Route path="/loans" element={<Protected><LoansPage /></Protected>} />
        <Route path="/properties" element={<Protected><PropertiesPage /></Protected>} />
        <Route path="/analyses" element={<Protected><AnalysesPage /></Protected>} />
        <Route path="/neighborhoods" element={<Protected><NeighborhoodsPage /></Protected>} />
        <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
        <Route path="/account" element={<Protected><AccountPage /></Protected>} />
        <Route path="/billing" element={<Protected><BillingPage /></Protected>} />
        <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
      </Routes>
    </TooltipProvider>
  )
}

export default App
