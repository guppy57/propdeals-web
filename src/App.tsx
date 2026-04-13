import { Routes, Route } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"
import { Toaster } from "@/components/ui/sonner"
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
import { ResearchTypesPage } from "@/pages/ResearchTypesPage.tsx"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { PageLayout } from "@/components/PageLayout"

export function App() {
  return (
    <TooltipProvider>
      <Toaster position="bottom-center" />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<ProtectedRoute><PageLayout /></ProtectedRoute>}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/assumption-sets" element={<AssumptionSetsPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/analyses" element={<AnalysesPage />} />
          <Route path="/neighborhoods" element={<NeighborhoodsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/research-types" element={<ResearchTypesPage />} />
        </Route>
      </Routes>
    </TooltipProvider>
  )
}

export default App
