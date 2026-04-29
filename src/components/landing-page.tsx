"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { UserSelectScreen } from "@/components/user-select-screen"

export function LandingPage({ staff }: { staff: string[] }) {
  const router = useRouter()
  const [primary, setPrimary] = React.useState<string | undefined>()
  const select = (value: string) => {
    setPrimary(value)
    window.localStorage.setItem("shift-audit-primary", value)
  }
  return <UserSelectScreen staff={staff} value={primary} onChange={select} onContinue={() => router.push("/dashboard")} />
}
