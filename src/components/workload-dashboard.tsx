"use client"

import * as React from "react"
import { addMonths, addYears, format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Activity, CalendarDays, Download, Moon, ShieldAlert, Users } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { DateRangePicker } from "@/components/date-range-picker"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Row = Record<string, any>
const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })
const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]
const chartConfig = { Fadial: { label: "Fadial", color: "var(--chart-1)" }, Fryling: { label: "Fryling", color: "var(--chart-2)" }, Balakumar: { label: "Balakumar", color: "var(--chart-3)" } } satisfies ChartConfig

function iso(d: Date) { return format(d, "yyyy-MM-dd") }
function parseISODate(s: string) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d) }
function inRange(d: string, start: string, end: string) { return d >= start && d <= end }
function csv(rows: Row[]) { if (!rows.length) return ""; const k = Object.keys(rows[0]); return [k.join(","), ...rows.map(r => k.map(x => JSON.stringify(r[x] ?? "")).join(","))].join("\n") }
function download(name: string, rows: Row[]) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv(rows)], { type: "text/csv" })); a.download = name; a.click(); URL.revokeObjectURL(a.href) }
function pivot(rows: Row[], x: string, y: string) { const m = new Map<string, Row>(); rows.forEach(r => { const k = r[x]; if (!m.has(k)) m.set(k, { [x]: k }); m.get(k)![r.person] = Number(r[y] || 0) }); return [...m.values()].sort((a, b) => String(a[x]).localeCompare(String(b[x]))) }
function summarize(pp: Row[]) { const by = new Map<string, Row[]>(); pp.forEach(r => { if (!by.has(r.person)) by.set(r.person, []); by.get(r.person)!.push(r) }); return [...by].map(([person, rows]) => { const sum = (k: string) => rows.reduce((a, r) => a + Number(r[k] || 0), 0); const hours = rows.map(r => Number(r.hours)); const n = rows.length || 1; const nights = sum("nights"), weekends = sum("weekends"), backups = sum("backups"); const avg = sum("hours") / n; return { person, pay_periods: rows.length, total_shifts: sum("shifts"), total_hours: sum("hours"), avg_hours_pp: avg, max_hours_pp: Math.max(...hours, 0), pp_ge_56: hours.filter(h => h >= 56).length, pp_ge_64: hours.filter(h => h >= 64).length, pp_ge_80: hours.filter(h => h >= 80).length, total_backups: backups, weekend_shifts: weekends, night_shifts: nights, backups_per_pp: backups / n, nights_per_pp: nights / n, weekends_per_pp: weekends / n, burden_index: avg + 4 * nights / n + 3 * weekends / n + 2 * backups / n } }) }

function SectionCards({ mine, peerAvg }: { mine: Row, peerAvg: number | null }) {
  const items = [
    ["Total Shifts", mine.total_shifts, `${mine.pp_ge_56} pay periods ≥56h`, <Activity key="i" />],
    ["Included Hours", mine.total_hours, "Backup = 0h", <CalendarDays key="i" />],
    ["Avg h / PP", mine.avg_hours_pp, peerAvg == null ? "Add peers to compare" : `${fmt.format(mine.avg_hours_pp - peerAvg)} vs peers`, <Users key="i" />],
    ["Max h / PP", mine.max_hours_pp, `${mine.pp_ge_64} periods ≥64h`, <ShieldAlert key="i" />],
    ["Night Shifts", mine.night_shifts, "fatigue burden", <Moon key="i" />],
  ]
  return <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">{items.map(([title, value, sub, icon]) => <Card key={String(title)} className="@container/card"><CardHeader><CardDescription>{title}</CardDescription><CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{fmt.format(Number(value))}</CardTitle><CardAction><Badge variant="outline">{icon as React.ReactNode}</Badge></CardAction></CardHeader><CardFooter className="flex-col items-start gap-1.5 text-sm"><div className="font-medium">{sub}</div><div className="text-muted-foreground">Pay period workload audit</div></CardFooter></Card>)}</div>
}

function WorkloadChart({ data, selected }: { data: Row[], selected: string[] }) {
  return <Card><CardHeader><CardTitle>Included clinical hours by pay period</CardTitle><CardDescription>Federal pay-period trend for selected people.</CardDescription></CardHeader><CardContent className="px-2 pt-4 sm:px-6 sm:pt-6"><ChartContainer config={chartConfig} className="aspect-auto h-[360px] w-full"><LineChart data={data}><CartesianGrid vertical={false} /><XAxis dataKey="pp_start" tickLine={false} axisLine={false} minTickGap={32} /><YAxis tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} />{selected.map((s, i) => <Line key={s} dataKey={s} type="monotone" stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />)}</LineChart></ChartContainer></CardContent></Card>
}
function Bars({ data, selected }: { data: Row[], selected: string[] }) { return <Card><CardHeader><CardTitle>Monthly included hours</CardTitle><CardDescription>Grouped by selected physicians.</CardDescription></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-[320px] w-full"><BarChart data={data}><CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} />{selected.map((s, i) => <Bar key={s} dataKey={s} fill={colors[i % colors.length]} radius={4} />)}</BarChart></ChartContainer></CardContent></Card> }
function AuditTable({ rows, cols, limit = 100 }: { rows: Row[], cols: string[], limit?: number }) { return <div className="overflow-hidden rounded-lg border"><Table><TableHeader className="bg-muted sticky top-0 z-10"><TableRow>{cols.map(c => <TableHead key={c}>{c}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.slice(0, limit).map((r, i) => <TableRow key={i}>{cols.map(c => <TableCell key={c}>{typeof r[c] === "number" ? fmt.format(r[c]) : r[c]}</TableCell>)}</TableRow>)}</TableBody></Table></div> }

export function WorkloadDashboard({ data }: { data: Row }) {
  const [primary, setPrimary] = React.useState(data.staff.includes("Fadial") ? "Fadial" : data.staff[0])
  const [peers, setPeers] = React.useState<string[]>([])
  const [tab, setTab] = React.useState("overview")
  const [range, setRange] = React.useState<DateRange | undefined>({ from: parseISODate(data.dateMin), to: parseISODate(data.dateMax) })
  const start = iso(range?.from ?? parseISODate(data.dateMin))
  const end = iso(range?.to ?? parseISODate(data.dateMax))
  const selected = [primary, ...peers.filter(p => p !== primary)]
  const pp = data.payPeriods.filter((r: Row) => selected.includes(r.person) && inRange(r.pp_start, start, end))
  const monthly = data.monthly.filter((r: Row) => selected.includes(r.person) && r.month >= start.slice(0, 7) && r.month <= end.slice(0, 7))
  const records = data.records.filter((r: Row) => selected.includes(r.person) && inRange(r.date, start, end))
  const summary = summarize(pp)
  const mine = summary.find(s => s.person === primary) || summary[0]
  const peerRows = summary.filter(s => s.person !== primary)
  const peerAvg = peerRows.length ? peerRows.reduce((a, s) => a + s.avg_hours_pp, 0) / peerRows.length : null
  const top = pp.filter((r: Row) => r.person === primary).sort((a: Row, b: Row) => b.hours - a.hours).slice(0, 10)
  const outliers = pp.filter((r: Row) => r.person === primary && (r.hours >= 56 || r.nights >= 2 || r.weekends >= 2 || r.backups >= 1)).sort((a: Row, b: Row) => b.hours - a.hours)
  const preset = (label: string, months?: number, years?: number) => <Button variant="outline" size="sm" onClick={() => { const max = parseISODate(data.dateMax); const from = years ? addYears(max, -years) : addMonths(max, -(months ?? 3)); setRange({ from, to: max }) }}>{label}</Button>

  return <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}><AppSidebar variant="inset" activeTab={tab} onTabChange={setTab} /><SidebarInset><SiteHeader /><div className="flex flex-1 flex-col"><div className="@container/main flex flex-1 flex-col gap-2"><div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"><div className="px-4 lg:px-6"><div className="flex flex-col gap-3 rounded-lg border bg-card p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center"><Select value={primary} onValueChange={setPrimary}><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent>{data.staff.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><Select onValueChange={(v) => { const value = String(v); if (!peers.includes(value) && value !== primary) setPeers([...peers, value]) }}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Add peer" /></SelectTrigger><SelectContent>{data.staff.filter((s: string) => s !== primary && !peers.includes(s)).map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><DateRangePicker value={range} onChange={setRange} /><Button onClick={() => download("shift-detail.csv", records)}><Download /> CSV</Button></div><div className="flex flex-wrap gap-2">{preset("Last 3 mo", 3)}{preset("Last 6 mo", 6)}{preset("Last 12 mo", 12)}{preset("Last 24 mo", 24)}{preset("All", undefined, 99)}{peers.map(p => <Badge key={p} variant="secondary" onClick={() => setPeers(peers.filter(x => x !== p))} className="cursor-pointer">{p} ×</Badge>)}</div></div></div><SectionCards mine={mine} peerAvg={peerAvg} /><div className="px-4 lg:px-6"><Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground"><b className="text-foreground">{primary}</b> averages <b className="text-foreground">{fmt.format(mine.avg_hours_pp)} h/pay period</b>. Heaviest pay period: <b className="text-foreground">{top[0]?.pp}</b> with <b className="text-foreground">{fmt.format(top[0]?.hours || 0)} hours</b>. Nights/weekends/backups are tracked because “not over 80” is not “fair.”</p></CardContent></Card></div><Tabs value={tab} onValueChange={setTab} className="px-4 lg:px-6"><TabsList className="flex flex-wrap h-auto"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="periods">Pay Periods</TabsTrigger><TabsTrigger value="comparison">Comparison</TabsTrigger><TabsTrigger value="outliers">Outliers</TabsTrigger><TabsTrigger value="detail">Detail</TabsTrigger><TabsTrigger value="assumptions">Assumptions</TabsTrigger></TabsList><TabsContent value="overview" className="space-y-4"><WorkloadChart data={pivot(pp, "pp_start", "hours")} selected={selected} /><Bars data={pivot(monthly, "month", "hours")} selected={selected} /><Card><CardHeader><CardTitle>Top 10 heaviest pay periods — {primary}</CardTitle></CardHeader><CardContent><AuditTable rows={top} cols={["person", "pp", "pp_start", "pp_end", "shifts", "hours", "backups", "weekends", "nights"]} /></CardContent></Card></TabsContent><TabsContent value="periods"><Card><CardHeader><CardTitle>Pay-period audit table</CardTitle></CardHeader><CardContent><AuditTable rows={pp} cols={["person", "pp", "pp_start", "pp_end", "shifts", "hours", "backups", "weekends", "nights"]} /></CardContent></Card></TabsContent><TabsContent value="comparison"><Card><CardHeader><CardTitle>Peer fairness summary</CardTitle><CardDescription>Add peers above to compare active pay-period-normalized burden.</CardDescription></CardHeader><CardContent><AuditTable rows={summary} cols={["person", "pay_periods", "total_shifts", "total_hours", "avg_hours_pp", "max_hours_pp", "total_backups", "weekend_shifts", "night_shifts", "burden_index"]} /></CardContent></Card></TabsContent><TabsContent value="outliers"><Card><CardHeader><CardTitle>Potential scheduler outliers</CardTitle><CardDescription>Pay periods with ≥56 hours, multiple nights/weekends, or backup burden.</CardDescription></CardHeader><CardContent><AuditTable rows={outliers} cols={["person", "pp", "pp_start", "pp_end", "shifts", "hours", "backups", "weekends", "nights"]} /></CardContent></Card></TabsContent><TabsContent value="detail"><Card><CardHeader><CardTitle>Shift-level detail</CardTitle></CardHeader><CardContent><AuditTable rows={records} cols={["person", "date", "dow", "pp", "raw", "type", "included_hours", "shift_count"]} /></CardContent></Card></TabsContent><TabsContent value="assumptions"><Card><CardHeader><CardTitle>Assumptions</CardTitle></CardHeader><CardContent><ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">{data.assumptions.map((a: string) => <li key={a}>{a}</li>)}<li>Burden index = avg hours/PP + 4*nights/PP + 3*weekends/PP + 2*backups/PP.</li></ul></CardContent></Card></TabsContent></Tabs></div></div></div></SidebarInset></SidebarProvider>
}
