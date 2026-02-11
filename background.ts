import { INITIAL_SETTINGS, KEYS, storage } from "~/src/storage/settings"

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  for (const [key, value] of Object.entries(INITIAL_SETTINGS)) {
    const existing = await storage.get(key)
    if (existing === undefined) await storage.set(key, value)
  }
})

let lastHeartbeatTime = 0

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "HEARTBEAT") {
    handleTimeTracking(msg.isShorts)
  }
  if (msg.type === "EXTEND_TIME") {
    extendTime()
  }
  if (msg.type === "EXTEND_SHORTS_TIME") {
    extendShortsTime()
  }
})

async function handleTimeTracking(isShorts: boolean = false) {
  const now = Date.now()
  // Prevent double counting if multiple tabs send heartbeats at once
  // Minimum 4 seconds must pass before we add another 5-second increment
  if (now - lastHeartbeatTime < 4000) return
  lastHeartbeatTime = now

  const today = new Date().toISOString().split("T")[0]
  const lastReset = await storage.get<string>(KEYS.LAST_RESET)

  // Reset at midnight
  if (lastReset !== today) {
    await storage.set(KEYS.DAILY_USAGE, 0)
    await storage.set(KEYS.IS_BLOCKED, false)
    await storage.set(KEYS.SHORTS_USAGE, 0)
    await storage.set(KEYS.IS_SHORTS_BLOCKED, false)
    await storage.set(KEYS.LAST_RESET, today)
    return
  }

  // Priority 1: Pause Mode - stop ALL timers
  const isPaused = await storage.get<boolean>(KEYS.IS_PAUSED)
  if (isPaused) return

  // Update Daily Usage (counts for everything on YouTube)
  // Only if daily limit is NOT reached yet
  const isDailyBlocked = await storage.get<boolean>(KEYS.IS_BLOCKED)

  if (!isDailyBlocked) {
    const usage = (await storage.get<number>(KEYS.DAILY_USAGE)) || 0
    const limitMinutes = (await storage.get<number>(KEYS.DAILY_LIMIT)) || 60

    const newUsageSeconds = usage + 5
    await storage.set(KEYS.DAILY_USAGE, newUsageSeconds)

    if (newUsageSeconds >= limitMinutes * 60) {
      await storage.set(KEYS.IS_BLOCKED, true)
    }
  }

  // Update Shorts Usage (only if on Shorts URL)
  if (isShorts) {
    const shortsUsage = (await storage.get<number>(KEYS.SHORTS_USAGE)) || 0
    const shortsLimit = (await storage.get<number>(KEYS.SHORTS_LIMIT)) || 5

    const newShortsUsage = shortsUsage + 5
    await storage.set(KEYS.SHORTS_USAGE, newShortsUsage)

    if (newShortsUsage >= shortsLimit * 60) {
      await storage.set(KEYS.IS_SHORTS_BLOCKED, true)
    }
  }
}

async function extendTime() {
  const currentLimit = await storage.get<number>(KEYS.DAILY_LIMIT)
  await storage.set(KEYS.DAILY_LIMIT, currentLimit + 5)
  await storage.set(KEYS.IS_BLOCKED, false)
}

async function extendShortsTime() {
  const currentLimit = await storage.get<number>(KEYS.SHORTS_LIMIT)
  await storage.set(KEYS.SHORTS_LIMIT, currentLimit + 5)
  await storage.set(KEYS.IS_SHORTS_BLOCKED, false)
}
