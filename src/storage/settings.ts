import { Storage } from "@plasmohq/storage"

export const storage = new Storage({ area: "local" })

export const KEYS = {
  DAILY_LIMIT: "dailyLimit", // number (minutes)
  DAILY_USAGE: "dailyUsage", // number (seconds)
  LAST_RESET: "lastReset", // string (YYYY-MM-DD)
  IS_BLOCKED: "isBlocked", // boolean
  IS_PAUSED: "isPaused", // boolean (Manual Block)
  HIDE_SHORTS: "hideShorts", // boolean
  SCROLL_LIMIT_ACTIVE: "scrollLimitActive", // boolean
  SCROLL_LIMIT_COUNT: "scrollLimitCount", // number
  RESTORE_DISLIKES: "restoreDislikes", // boolean
  THEME: "theme", // "dark" | "light"
  SHORTS_USAGE: "shortsUsage", // number (seconds)
  SHORTS_LIMIT: "shortsLimit", // number (minutes)
  IS_SHORTS_BLOCKED: "isShortsBlocked" // boolean
}

export const INITIAL_SETTINGS = {
  [KEYS.DAILY_LIMIT]: 60,
  [KEYS.DAILY_USAGE]: 0,
  [KEYS.IS_BLOCKED]: false,
  [KEYS.IS_PAUSED]: false,
  [KEYS.HIDE_SHORTS]: true,
  [KEYS.SCROLL_LIMIT_ACTIVE]: true,
  [KEYS.SCROLL_LIMIT_COUNT]: 10,
  [KEYS.RESTORE_DISLIKES]: true,
  [KEYS.THEME]: "dark",
  [KEYS.SHORTS_USAGE]: 0,
  [KEYS.SHORTS_LIMIT]: 5,
  [KEYS.IS_SHORTS_BLOCKED]: false
}
