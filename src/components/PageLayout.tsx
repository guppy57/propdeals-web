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
}

export function PageLayout() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? ""

  return (
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
        <SiteHeader title={title} />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
