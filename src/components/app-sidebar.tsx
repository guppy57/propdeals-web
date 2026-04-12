import * as React from "react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { useNavigate } from "react-router-dom"

import { NavMain } from "@/components/nav-main"
import { NavRealEstate } from "@/components/nav-real-estate"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  SlidersHorizontalIcon,
  LandmarkIcon,
  HomeIcon,
  BarChart3Icon,
  MapPinnedIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  CommandIcon,
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Assumption Sets",
      url: "/assumption-sets",
      icon: <SlidersHorizontalIcon />,
    },
    {
      title: "Loans",
      url: "/loans",
      icon: <LandmarkIcon />,
    },
  ],
  realEstate: [
    {
      title: "Properties",
      url: "/properties",
      icon: <HomeIcon />,
    },
    {
      title: "Analyses",
      url: "/analyses",
      icon: <BarChart3Icon />,
    },
    {
      title: "Neighborhoods",
      url: "/neighborhoods",
      icon: <MapPinnedIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings2Icon />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <CircleHelpIcon />,
    },
    {
      title: "Search",
      url: "#",
      icon: <SearchIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate("/", { replace: true })
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Propdeals</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavRealEstate items={data.realEstate} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name:
              user?.user_metadata?.full_name ??
              user?.user_metadata?.name ??
              "there",
            email: user?.email ?? "",
            avatar: user?.user_metadata?.avatar_url ?? "",
          }}
          signout={handleSignOut}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
