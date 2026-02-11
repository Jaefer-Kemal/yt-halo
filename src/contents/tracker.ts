import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["*://*.youtube.com/*", "*://*.youtu.be/*"],
  run_at: "document_start"
}

setInterval(() => {
  if (document.visibilityState === "visible" && !document.hidden) {
    const isShorts = window.location.pathname.startsWith("/shorts/")
    chrome.runtime.sendMessage({ type: "HEARTBEAT", isShorts })
  }
}, 5000)
