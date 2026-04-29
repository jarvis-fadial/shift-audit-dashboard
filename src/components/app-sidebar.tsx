"use client"

import * as React from "react"
import { BarChart3, CalendarRange, Gauge, Info, ListChecks, Stethoscope, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const nav = [
  { value: "overview", title: "Overview", icon: Gauge },
  { value: "periods", title: "Pay Periods", icon: CalendarRange },
  { value: "comparison", title: "Comparison", icon: Users },
  { value: "outliers", title: "Outliers", icon: BarChart3 },
  { value: "detail", title: "Detail", icon: ListChecks },
  { value: "assumptions", title: "Assumptions", icon: Info },
]

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  activeTab?: string
  onTabChange?: (value: string) => void
}

export function AppSidebar({ activeTab = "overview", onTabChange, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Stethoscope className="size-5!" />
              <span className="text-base font-semibold">Shift Audit</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Audit Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton isActive={activeTab === item.value} tooltip={item.title} onClick={() => onTabChange?.(item.value)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
