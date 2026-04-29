"use client"

import * as React from "react"
import { BarChart3, CalendarRange, ChevronsUpDown, Gauge, Info, ListChecks, Stethoscope, Users } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  primary?: string
  staff?: string[]
  onPrimaryChange?: (value: string) => void
}

export function AppSidebar({
  activeTab = "overview",
  onTabChange,
  primary,
  staff = [],
  onPrimaryChange,
  ...props
}: AppSidebarProps) {
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
      <SidebarFooter>
        <div className="px-2 pb-2">
          <div className="mb-2 flex items-center gap-2 text-sm">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {(primary ?? "?").slice(0, 1)}
            </div>
            <div className="grid flex-1 leading-tight">
              <span className="truncate font-medium">{primary ?? "Select user"}</span>
              <span className="truncate text-xs text-muted-foreground">Primary schedule</span>
            </div>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </div>
          <Select value={primary} onValueChange={(value) => value && onPrimaryChange?.(value)}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Switch user" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
