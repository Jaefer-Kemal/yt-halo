import { useEffect, useState } from "react"

import "./style.css"

// --- TYPES ---
type ViewState = "HOME" | "SETTINGS"
type Theme = "dark" | "light"
type ShortsStrategy = "hide" | "block" | "allow-5m"

function PopupApp() {
  const [view, setView] = useState<ViewState>("HOME")
  const [theme, setTheme] = useState<Theme>("dark") // Default to DARK

  // Apply Theme Class to HTML tag
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

  return (
    <div className="w-[400px] h-[600px] bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col overflow-hidden relative selection:bg-primary selection:text-background-dark font-display transition-colors duration-300">
      {/* 1. HOME VIEW */}
      {view === "HOME" && (
        <HomeView onOpenSettings={() => setView("SETTINGS")} />
      )}

      {/* 2. SETTINGS VIEW */}
      {view === "SETTINGS" && (
        <SettingsView
          onBack={() => setView("HOME")}
          currentTheme={theme}
          onToggleTheme={() =>
            setTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
        />
      )}

      {/* GLOBAL BACKGROUND ORBS */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -right-[10%] -top-[10%] h-[300px] w-[300px] rounded-full bg-teal-100/40 opacity-50 blur-[80px] dark:bg-primary/10 transition-colors duration-500"></div>
        <div className="absolute -bottom-[10%] -left-[10%] h-[250px] w-[250px] rounded-full bg-teal-200/30 opacity-40 blur-[80px] dark:bg-primary/5 transition-colors duration-500"></div>
      </div>
    </div>
  )
}

// --- SUB-COMPONENT: HOME ---
function HomeView({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [isTimeLimitActive, setIsTimeLimitActive] = useState(true)

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 bg-white/50 backdrop-blur-sm dark:bg-[#112222]/50 sticky top-0 z-20 transition-colors">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-900 dark:text-white text-[28px]">
            all_inclusive
          </span>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            YT Halo
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Active
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="group flex items-center justify-center text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors"
            title="Settings">
            <span className="material-symbols-outlined transition-transform group-hover:rotate-90">
              settings
            </span>
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto halo-scroll px-6 pb-6">
        {/* Timer Display */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isTimeLimitActive ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative mb-2">
              <div className="absolute inset-0 -z-10 blur-[40px] opacity-20 bg-primary rounded-full"></div>
              <h1 className="text-5xl font-light tracking-tighter text-gray-900 dark:text-white">
                1<span className="text-gray-400 dark:text-gray-600">h</span> 20
                <span className="text-gray-400 dark:text-gray-600">m</span>
              </h1>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-[#92c9c9]">
              Time Remaining
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-3 py-2">
          <ToggleCard
            icon="visibility_off"
            title="Hide Shorts"
            subtitle="Remove from feed"
            defaultChecked={true}
          />
          <ToggleCard
            icon="swap_vert"
            title="Scroll Limit"
            subtitle="Stop infinite scroll"
            defaultChecked={true}
          />

          {/* Time Limit Special Toggle */}
          <div className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-[#1a2e2e]">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#234848] text-gray-600 dark:text-white">
                <span className="material-symbols-outlined">
                  hourglass_empty
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium text-gray-900 dark:text-white">
                  Time Limit
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Daily cap active
                </span>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                checked={isTimeLimitActive}
                onChange={(e) => setIsTimeLimitActive(e.target.checked)}
                className="peer sr-only"
                type="checkbox"
              />
              <div className="peer h-7 w-12 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700 dark:border-gray-600"></div>
            </label>
          </div>

          <ToggleCard
            icon="thumb_down"
            title="Restore Dislikes"
            subtitle="Show counter"
            defaultChecked={false}
          />
        </div>
      </main>

      {/* Footer */}
      <div className="mt-auto px-6 py-6 bg-background-light dark:bg-background-dark border-t border-gray-100 dark:border-white/5 z-20">
        <button className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-gray-900 dark:bg-primary px-6 py-4 transition-all hover:bg-gray-800 dark:hover:bg-[#3ffbfb] active:scale-[0.98] shadow-lg shadow-gray-900/20 dark:shadow-primary/20">
          <span className="material-symbols-outlined text-white dark:text-black">
            pause_circle
          </span>
          <span className="text-lg font-bold text-white dark:text-black">
            Pause YouTube
          </span>
        </button>
      </div>
    </div>
  )
}

// --- SUB-COMPONENT: SETTINGS ---
interface SettingsProps {
  onBack: () => void
  currentTheme: Theme
  onToggleTheme: () => void
}

function SettingsView({ onBack, currentTheme, onToggleTheme }: SettingsProps) {
  // --- STATE ---
  const [dailyLimit, setDailyLimit] = useState(45)
  const [scrollLimit, setScrollLimit] = useState(10)
  const [shortsStrategy, setShortsStrategy] = useState<ShortsStrategy>("hide")

  const progressPercentage = (dailyLimit / 120) * 100

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background-light/95 px-4 py-4 backdrop-blur-md dark:bg-background-dark/95 border-b border-gray-100 dark:border-white/5">
        <button
          onClick={onBack}
          className="group flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10">
          <span className="material-symbols-outlined text-slate-900 dark:text-white text-[24px]">
            arrow_back
          </span>
        </button>
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <button
          onClick={() => {
            setDailyLimit(45)
            setScrollLimit(10)
            setShortsStrategy("hide")
          }}
          className="flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold text-teal-600 transition-opacity hover:opacity-80 dark:text-primary">
          Reset
        </button>
      </header>

      {/* Settings Content */}
      <main className="flex-1 overflow-y-auto halo-scroll px-5 py-6 space-y-6">
        {/* Time Slider */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider opacity-80">
            Daily Allowance
          </h3>
          <div className="group relative rounded-2xl bg-white p-5 shadow-sm dark:bg-surface-dark border border-slate-100 dark:border-white/5">
            <div className="flex items-end justify-between mb-4">
              <span className="text-xs font-medium text-slate-500 dark:text-gray-400">
                Minutes per day
              </span>
              <div className="text-2xl font-bold text-teal-600 dark:text-primary">
                {dailyLimit}m
              </div>
            </div>
            <div className="relative flex h-6 w-full items-center">
              <div className="absolute h-1.5 w-full rounded-full bg-slate-200 dark:bg-surface-highlight overflow-hidden">
                <div
                  className="h-full bg-teal-500 dark:bg-primary opacity-30"
                  style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="absolute w-full h-6 opacity-0 cursor-pointer z-10"
              />
              <div
                className="pointer-events-none absolute h-1.5 rounded-full bg-teal-500 dark:bg-primary transition-all duration-75"
                style={{ width: `${progressPercentage}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-4 w-4 rounded-full bg-teal-500 dark:bg-primary shadow-[0_0_10px_rgba(19,236,236,0.5)]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Scroll Limit */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider opacity-80">
            Feed Control
          </h3>
          <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm dark:bg-surface-dark border border-slate-100 dark:border-white/5">
            <div className="flex flex-col">
              <span className="font-medium text-slate-900 dark:text-white text-sm">
                Scroll Limit
              </span>
              <span className="text-xs text-slate-500 dark:text-gray-400">
                Videos per session
              </span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-surface-highlight rounded-full p-1 border border-slate-100 dark:border-white/5">
              <button
                onClick={() => setScrollLimit((prev) => Math.max(1, prev - 1))}
                className="size-7 flex items-center justify-center rounded-full bg-white dark:bg-surface-dark text-slate-600 dark:text-gray-300 shadow-sm hover:text-teal-600 active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-xs">
                  remove
                </span>
              </button>
              <span className="w-6 text-center font-bold text-slate-900 dark:text-white text-sm">
                {scrollLimit}
              </span>
              <button
                onClick={() => setScrollLimit((prev) => prev + 1)}
                className="size-7 flex items-center justify-center rounded-full bg-teal-500 dark:bg-primary text-white dark:text-black shadow-md active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-xs">add</span>
              </button>
            </div>
          </div>
        </section>

        {/* Shorts Strategy */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider opacity-80">
            Shorts
          </h3>
          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-surface-dark border border-slate-100 dark:border-white/5">
            <div className="flex w-full rounded-xl bg-slate-100 p-1 dark:bg-surface-highlight">
              <ShortsBtn
                label="Hide"
                active={shortsStrategy === "hide"}
                onClick={() => setShortsStrategy("hide")}
              />
              <ShortsBtn
                label="Block"
                active={shortsStrategy === "block"}
                onClick={() => setShortsStrategy("block")}
              />
              <ShortsBtn
                label="Allow 5m"
                active={shortsStrategy === "allow-5m"}
                onClick={() => setShortsStrategy("allow-5m")}
              />
            </div>
          </div>
        </section>

        {/* App Settings / Appearance */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider opacity-80">
            App Settings
          </h3>
          <div className="rounded-2xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 overflow-hidden">
            {/* Theme Toggle */}
            <div className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Theme
                </span>
                <span className="text-xs text-slate-400">
                  Current: {currentTheme === "dark" ? "Dark" : "Light"}
                </span>
              </div>
              <button
                onClick={onToggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${currentTheme === "dark" ? "bg-primary" : "bg-slate-300"}`}>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentTheme === "dark" ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>

            {/* Creator Info */}
            <button
              onClick={() => window.open("https://github.com/jaefer", "_blank")}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Creator Info
              </span>
              <span className="material-symbols-outlined text-slate-400 text-sm">
                open_in_new
              </span>
            </button>

            {/* About */}
            <div className="w-full flex items-center justify-between p-4">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Version
              </span>
              <span className="text-xs text-slate-400">v1.0.0</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

// Helper: Shorts Button
function ShortsBtn({
  label,
  active,
  onClick
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all duration-200 ${
        active
          ? "bg-white shadow-sm text-slate-900 dark:bg-primary dark:text-background-dark"
          : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
      }`}>
      {label}
    </button>
  )
}

// Helper: Toggle Card
function ToggleCard({ icon, title, subtitle, defaultChecked }: any) {
  return (
    <div className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-[#1a2e2e]">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#234848] text-gray-600 dark:text-white">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-medium text-gray-900 dark:text-white">
            {title}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </span>
        </div>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          defaultChecked={defaultChecked}
          className="peer sr-only"
          type="checkbox"
        />
        <div className="peer h-7 w-12 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700 dark:border-gray-600"></div>
      </label>
    </div>
  )
}

export default PopupApp
