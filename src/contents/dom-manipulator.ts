import type { PlasmoCSConfig } from "plasmo"

import { KEYS, storage } from "~/src/storage/settings"

export const config: PlasmoCSConfig = {
  matches: ["*://*.youtube.com/*"],
  run_at: "document_end"
}

// --------------------
// State
// --------------------

let currentVideoId = ""
let likesValue = 0
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
      textSpan.className = "halo-dislike-text"
      textSpan.style.marginLeft = "6px"
      textSpan.style.fontSize = "12px"
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
  const [active, isBlocked] = await Promise.all([
    storage.get(KEYS.RESTORE_DISLIKES),
    storage.get(KEYS.IS_BLOCKED)
  ])

  if (!active || isBlocked) return

  const videoId = getVideoId()
  if (!videoId) return

  const textContainer = isShorts()
    ? getShortsDislikeTextContainer()
    : getWatchDislikeTextContainer()

  if (!textContainer) return

  if (videoId !== currentVideoId || textContainer.innerText === "Dislike") {
    currentVideoId = videoId

    try {
      await fetchVotes(videoId)
      textContainer.innerText = numberFormat(dislikesValue)
    } catch (e) {
      console.error("[YT-Halo] Fetch error:", e)
    }
  }
}

// --------------------
// Lifecycle
// --------------------

window.addEventListener("yt-navigate-finish", () => {
  setTimeout(updateDom, 400)
})

setInterval(updateDom, 1000)

window.addEventListener("load", updateDom)

document.addEventListener("click", () => {
  setTimeout(updateDom, 300)
})
