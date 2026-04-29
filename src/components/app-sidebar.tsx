"use client"

import * as React from "react"
import { BarChart3, CalendarRange, ChevronsUpDown, Gauge, Info, ListChecks, Stethoscope, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const filteredStaff = staff.filter((name) => name.toLowerCase().includes(query.toLowerCase())).slice(0, 30)

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
        <SidebarMenu>
          <SidebarMenuItem>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger render={<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" />}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {(primary ?? "?").slice(0, 1)}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{primary ?? "Select user"}</span>
                  <span className="truncate text-xs text-muted-foreground">Primary schedule</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-64 p-2">
                <div className="space-y-2">
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search staff…" />
                  <div className="max-h-72 overflow-y-auto rounded-md border p-1">
                    {filteredStaff.map((name) => (
                      <Button
                        key={name}
                        type="button"
                        variant={name === primary ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          onPrimaryChange?.(name)
                          setOpen(false)
                          setQuery("")
                        }}
                      >
                        {name}
                      </Button>
                    ))}
                    {!filteredStaff.length && <p className="p-2 text-sm text-muted-foreground">No staff found.</p>}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
