"use client"

import * as React from "react"
import { ArrowRight, Stethoscope } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function UserSelectScreen({
  staff,
  value,
  onChange,
  onContinue,
}: {
  staff: string[]
  value?: string
  onChange: (value: string) => void
  onContinue?: () => void
}) {
  const [query, setQuery] = React.useState("")
  const visibleStaff = staff.filter((name) => name.toLowerCase().includes(query.toLowerCase())).slice(0, 24)

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Stethoscope className="size-6" />
          </div>
          <CardTitle className="text-2xl">Choose your schedule</CardTitle>
          <CardDescription>
            Select a primary staff member to audit. Peer comparison can be added from the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search staff…" />
          <div className="max-h-72 overflow-y-auto rounded-lg border p-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {visibleStaff.map((name) => (
                <Button
                  key={name}
                  type="button"
                  variant={value === name ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => onChange(name)}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={!value} onClick={onContinue}>
            Open audit <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
