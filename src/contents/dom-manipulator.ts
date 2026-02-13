import type { PlasmoCSConfig } from "plasmo"

import { KEYS, storage } from "~/src/storage/settings"

export const config: PlasmoCSConfig = {
  matches: ["*://*.youtube.com/*"],
  run_at: "document_start" 
}

// --------------------
// State
// --------------------
let currentVideoId = ""
let lastFetchedId = ""
let dislikesCache = "Dislike"
let isUpdating = false
let dislikesValue = 0

// --------------------
// Utils
// --------------------

const isShorts = () => window.location.pathname.startsWith("/shorts")

const numberFormat = (num: number) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short"
  }).format(num)

const getVideoId = () => {
  const url = new URL(window.location.href)

  if (url.pathname.startsWith("/shorts/")) {
    return url.pathname.split("/")[2]
  }

  return url.searchParams.get("v")
}

// =====================================================
// WATCH PAGE  (SAFE — matches original RYD exactly)
// =====================================================

const getButtons = (): HTMLElement | null => {
  const menuContainer = document.getElementById("menu-container")

  if (menuContainer?.offsetParent === null) {
    return (
      document.querySelector("ytd-menu-renderer.ytd-watch-metadata > div") ??
      document.querySelector(
        "ytd-menu-renderer.ytd-video-primary-info-renderer > div"
      )
    )
  }

  return menuContainer?.querySelector(
    "#top-level-buttons-computed"
  ) as HTMLElement
}

const getDislikeButton = (buttons: HTMLElement): HTMLElement | null => {
  if (!buttons) return null

  const firstChild = buttons.children[0]

  if (firstChild?.tagName === "YTD-SEGMENTED-LIKE-DISLIKE-BUTTON-RENDERER") {
    return (firstChild.children[1] ||
      document.querySelector("#segmented-dislike-button")) as HTMLElement
  }

  if (buttons.querySelector("segmented-like-dislike-button-view-model")) {
    return buttons.querySelector("dislike-button-view-model") as HTMLElement
  }

  return buttons.children[1] as HTMLElement
}

const getWatchDislikeTextContainer = (): HTMLElement | null => {
  const buttons = getButtons()
  if (!buttons) return null

  const dislikeBtn = getDislikeButton(buttons)
  if (!dislikeBtn) return null

  let result =
    dislikeBtn.querySelector("#text") ??
    dislikeBtn.getElementsByTagName("yt-formatted-string")[0] ??
    dislikeBtn.querySelector("span[role='text']")

  // RYD safety: create text container if missing
  if (!result) {
    const btn = dislikeBtn.querySelector("button")
    if (btn) {
      const textSpan = document.createElement("span")
      textSpan.id = "text"
      textSpan.className = "halo-dislike-text yt-spec-button-shape-next__button-text-content"
      textSpan.style.marginLeft = "6px"
      btn.appendChild(textSpan)
      btn.style.width = "auto"
      btn.style.display = "flex"
      btn.style.alignItems = "center"
      btn.style.justifyContent = "center"
      result = textSpan
    }
  }

  return result as HTMLElement
}

// =====================================================
// SHORTS (modern DOM)
// =====================================================

const getShortsDislikeTextContainer = (): HTMLElement | null => {
  const spans = document.querySelectorAll(
    ".yt-spec-button-shape-with-label__label span[role='text']"
  )

  for (const span of spans) {
    if (span.textContent?.trim() === "Dislike") {
      return span as HTMLElement
    }
  }

  return null
}

// --------------------
// Fetch
// --------------------

const fetchVotes = async (videoId: string) => {
  const res = await fetch(
    `https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`
  )

  const data = await res.json()

  likesValue = data.likes
  dislikesValue = data.dislikes
}

// --------------------
// Main
// --------------------

const updateDom = async () => {
  // Prevent multiple simultaneous fetch calls
  if (isUpdating) return
  
  const videoId = getVideoId()
  if (!videoId) return

  const textContainer = isShorts()
    ? getShortsDislikeTextContainer()
    : getWatchDislikeTextContainer()

  if (!textContainer) return

  // Check if we need to update:
  // 1. Video changed OR 
  // 2. YouTube reset the text to "Dislike" (the "escape" problem)
  const isDefaultText = textContainer.innerText.trim() === "Dislike" || textContainer.innerText.trim() === ""
  
  if (videoId !== currentVideoId || isDefaultText) {
    currentVideoId = videoId
    
    // If it's a new video, fetch. If it's the same video but text escaped, use cache.
    if (videoId !== lastFetchedId) {
      isUpdating = true
      try {
        await fetchVotes(videoId)
        dislikesCache = numberFormat(dislikesValue)
        lastFetchedId = videoId
      } catch (e) {
        console.error("[YT-Halo] Fetch error:", e)
      } finally {
        isUpdating = false
      }
    }

    // Apply the text
    if (textContainer.innerText !== dislikesCache) {
      textContainer.innerText = dislikesCache
      // Remove the 'is-empty' attribute which YouTube uses to hide text
      textContainer.removeAttribute("is-empty") 
    }
  }
}

// --------------------
// Efficient Observation
// --------------------

// This replaces the heavy setInterval
const setupObserver = () => {
  const observer = new MutationObserver(() => {
    updateDom()
  })

  // Watch the body for changes in the menu or navigation
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

// --------------------
// Lifecycle
// --------------------

// 1. Handle Navigation
window.addEventListener("yt-navigate-finish", () => {
  // Small delay to let YT finish its initial DOM swap
  setTimeout(updateDom, 200)
})

// 2. Initial Load
if (document.readyState === "complete") {
  updateDom()
  setupObserver()
} else {
  window.addEventListener("load", () => {
    updateDom()
    setupObserver()
  })
}