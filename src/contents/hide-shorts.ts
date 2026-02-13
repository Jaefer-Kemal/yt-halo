import { KEYS, storage } from "~/src/storage/settings"

// Utility: Check if on Shorts page
const isShortsPage = () => window.location.pathname.startsWith("/shorts")

// Hide Shorts containers
function hideShortsUI() {
  // Shorts page player
  if (isShortsPage()) {
    document.querySelectorAll("ytd-reel-player-overlay-renderer, ytd-reel-player-renderer").forEach(el => {
      (el as HTMLElement).style.display = "none"
    })
    const reelContainer = document.getElementById("reel-player-container")
    if (reelContainer) (reelContainer as HTMLElement).style.display = "none"
  }
  // Shorts shelf on main page (main grid)
  document.querySelectorAll('ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer').forEach(el => {
    (el as HTMLElement).style.display = "none"
  })
}

// Restore Shorts containers
function restoreShortsUI() {
  document.querySelectorAll("ytd-reel-player-overlay-renderer, ytd-reel-player-renderer").forEach(el => {
    (el as HTMLElement).style.display = ""
  })
  const reelContainer = document.getElementById("reel-player-container")
  if (reelContainer) (reelContainer as HTMLElement).style.display = ""
  document.querySelectorAll('ytd-rich-shelf-renderer[is-shorts], ytd-reel-shelf-renderer').forEach(el => {
    (el as HTMLElement).style.display = ""
  })
}

function observeAndHideShorts() {
  const observer = new MutationObserver(() => {
    storage.get(KEYS.HIDE_SHORTS).then((hideShorts: boolean) => {
      if (hideShorts) {
        hideShortsUI()
      } else {
        restoreShortsUI()
      }
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
  window.addEventListener("yt-navigate-finish", () => {
    storage.get(KEYS.HIDE_SHORTS).then((hideShorts: boolean) => {
      if (hideShorts) {
        hideShortsUI()
      } else {
        restoreShortsUI()
      }
    })
  })
}

// Initial run
storage.get(KEYS.HIDE_SHORTS).then((hideShorts: boolean) => {
  if (hideShorts) {
    hideShortsUI()
  }
  observeAndHideShorts()
})

// Listen for storage changes (from popup toggle)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[KEYS.HIDE_SHORTS]) {
    if (changes[KEYS.HIDE_SHORTS].newValue) {
      hideShortsUI()
    } else {
      restoreShortsUI()
    }
  }
})
