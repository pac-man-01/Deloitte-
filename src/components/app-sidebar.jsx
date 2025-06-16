import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  Waypoints,
  UsersIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
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
import { useAuth } from "@/context/AuthContext"

const employeeData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/home",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Skill",
      url: "/home/skills",
      icon: ListIcon,
    },
    // {
    //   title: "Learning Pathway",
    //   url: "/home/learning-pathway",
    //   icon: Waypoints,
    // },
    {
      title: "Leaderboard",
      url: "/home/leaderboard",
      icon: BarChartIcon,
    },
    {
      title: "Learning History",
      url: "/home/learning-history",
      icon: FolderIcon,
    },
    {
      title: "Profile",
      url: "/home/profile",
      icon: UsersIcon,
    },
    {
      title: "Skill Badge",
      url: "/home/skill-badge",
      icon: ClipboardListIcon,
    },
    {
      title: "My Badges",
      url: "/home/skill-badge-mybadge",
      icon: CameraIcon,
    },
    {
      title: "My Applications",
      url: "/home/skill-badge-application",
      icon: CameraIcon,
    },
    {
      title: "Take Quiz",
      url: "/home/take-quiz",
      icon: CameraIcon,
    },
  ],
}

const adminData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Skill Badge Applications",
      url: "/admin/badge-approve",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Generate Quiz",
      url: "/admin/gen-quiz",
      icon: LayoutDashboardIcon,
    },
  ]
}

export function AppSidebar({
  ...props
}) {
  const { currentUser, role } = useAuth();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Deloitte.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {
          role == 'employee' ?
            <NavMain items={employeeData.navMain} /> :
            ""
        }

        {
          role == 'admin' ?
            <NavMain items={adminData.navMain} /> :
            ""
        }
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
