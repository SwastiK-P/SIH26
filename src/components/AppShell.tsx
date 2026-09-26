import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  Bot,
  CalendarClock,
  FolderOpen,
  LayoutDashboard,
  Moon,
  Search,
  Share2,
  Sun,
  TriangleAlert,
  Upload,
  Users,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { entityVar, ENTITY_ICON, ENTITY_LABEL } from "@/lib/constants"
import { useGraph } from "@/providers/GraphProvider"
import { useTable } from "@/hooks/use-table"
import { useTheme } from "@/providers/ThemeProvider"
import { cn } from "@/lib/utils"
import type { Alert } from "@/lib/types"

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/network", label: "Network", icon: Share2 },
  { to: "/entities", label: "Entities", icon: Users },
  { to: "/cases", label: "Cases", icon: FolderOpen },
  { to: "/timeline", label: "Timeline", icon: CalendarClock },
  { to: "/alerts", label: "Alerts", icon: TriangleAlert },
  { to: "/ingest", label: "Ingest", icon: Upload },
  { to: "/assistant", label: "Assistant", icon: Bot },
]

export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { entities } = useGraph()
  const { rows: alerts } = useTable<Alert>("alerts")
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const openAlerts = alerts.filter((a) => a.status === "new" || a.status === "reviewing").length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const go = (to: string) => {
    setPaletteOpen(false)
    navigate(to)
  }

  return (
    <div className="flex min-h-screen">
      {/* ---------------------------------------------------------- sidebar */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r bg-card/40 md:flex">
        <Link to="/" className="flex items-center gap-2.5 px-5 py-4">
          <span className="grid size-7 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/25">
            <Share2 className="size-3.5 text-primary" />
          </span>
          <span className="text-sm leading-tight font-semibold">
            Network
            <span className="block text-[11px] font-normal text-muted-foreground">
              Criminal analysis
            </span>
          </span>
        </Link>

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {to === "/alerts" && openAlerts > 0 && (
                <span className="tabular rounded-full bg-primary/15 px-1.5 text-[11px] font-medium text-primary">
                  {openAlerts}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <p className="border-t px-5 py-3 text-[11px] leading-relaxed text-muted-foreground">
          Decision-support only. Findings are generated from synthetic data and
          require investigator verification.
        </p>
      </aside>

      {/* ------------------------------------------------------------- main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-8">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-ring/40 hover:text-foreground"
          >
            <Search className="size-3.5" />
            <span className="flex-1 text-left">Search entities</span>
            <kbd className="hidden rounded border px-1.5 py-0.5 text-[10px] sm:inline">
              &#8984;K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <span className="hidden text-xs text-muted-foreground sm:inline">Investigator</span>
            <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-medium">
              IN
            </span>
          </div>
        </header>

        {/* Mobile nav: the sidebar is hidden below md. */}
        <nav className="scroll-slim flex gap-1 overflow-x-auto border-b px-4 py-2 md:hidden">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )
              }
            >
              <Icon className="size-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>

      {/* ---------------------------------------------------- command palette */}
      <CommandDialog
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        title="Search"
        description="Jump to an entity or a section"
      >
        <CommandInput placeholder="Search entities, or jump to a section..." />
        <CommandList>
          <CommandEmpty>Nothing matched.</CommandEmpty>

          <CommandGroup heading="Entities">
            {entities.map((e) => {
              const Icon = ENTITY_ICON[e.type]
              return (
                <CommandItem
                  key={e.id}
                  value={`${e.name} ${e.aliases.join(" ")} ${ENTITY_LABEL[e.type]}`}
                  onSelect={() => go(`/entities/${e.id}`)}
                >
                  <Icon className="size-4" style={{ color: entityVar(e.type) }} />
                  <span>{e.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {ENTITY_LABEL[e.type]}
                  </span>
                </CommandItem>
              )
            })}
          </CommandGroup>

          <CommandGroup heading="Go to">
            {NAV.map(({ to, label, icon: Icon }) => (
              <CommandItem key={to} value={label} onSelect={() => go(to)}>
                <Icon className="size-4" />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
