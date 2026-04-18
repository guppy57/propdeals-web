import * as React from "react"
import { Outlet, useLocation } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

const PAGE_TITLES: Record<string, string> = {
  "/home": "Home",
  "/assumption-sets": "Assumption Sets",
  "/loans": "Loans",
  "/properties": "Properties",
  "/analyses": "Analyses",
  "/neighborhoods": "Neighborhoods",
  "/settings": "Settings",
  "/account": "Account",
  "/billing": "Billing",
  "/notifications": "Notifications",
  "/research-types": "Research Types",
  "/filters": "Filters",
}

export const PageHeaderContext = React.createContext<{
  setHeader: (node: React.ReactNode) => void
}>({ setHeader: () => {} })

export function PageLayout() {
  const location = useLocation()

  const defaultHeader = (pathname: string) => (
    <h1 className="text-base font-medium">{PAGE_TITLES[pathname] ?? ""}</h1>
  )

  const [headerContent, setHeaderContent] = React.useState<React.ReactNode>(
    () => defaultHeader(location.pathname)
  )

  // Reset to default title whenever the route changes
  React.useEffect(() => {
    setHeaderContent(defaultHeader(location.pathname))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <PageHeaderContext.Provider value={{ setHeader: setHeaderContent }}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader>{headerContent}</SiteHeader>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </PageHeaderContext.Provider>
  )
}
