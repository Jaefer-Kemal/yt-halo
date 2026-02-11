import cssText from "data-text:../style.css"
import type { PlasmoCSConfig } from "plasmo"

import { useStorage } from "@plasmohq/storage/hook"

import { KEYS } from "~/src/storage/settings"

export const config: PlasmoCSConfig = {
  matches: ["*://*.youtube.com/*", "*://*.youtu.be/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const Overlay = () => {
  const [isBlocked] = useStorage(KEYS.IS_BLOCKED, false)
  const [isPaused] = useStorage(KEYS.IS_PAUSED, false)
  const [isShortsBlocked] = useStorage(KEYS.IS_SHORTS_BLOCKED, false)

  // Determine actual blocking state
  // Prioritize PAUSE > DAILY BLOCK > SHORTS BLOCK (if on shorts)

  if (isPaused) {
    return <BlockedScreen reason="paused" />
  }

  if (isBlocked) {
    return <BlockedScreen reason="daily-limit" />
  }

  // Check if we are actually on a shorts page for Shorts Blocking
  const isShorts = window.location.pathname.startsWith("/shorts/")
  if (isShortsBlocked && isShorts) {
    return <BlockedScreen reason="shorts-limit" />
  }

  return null
}

const BlockedScreen = ({
  reason
}: {
  reason: "paused" | "daily-limit" | "shorts-limit"
}) => {
  const title =
    reason === "paused"
      ? "YouTube Paused"
      : reason === "shorts-limit"
        ? "Shorts Limit Reached"
        : "Time for a break?"
  const message =
    reason === "paused"
      ? "You paused YouTube manually."
      : reason === "shorts-limit"
        ? "You've reached your Shorts limit for today."
        : "You’ve reached your daily limit. Great job sticking to your goals."

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#0a1515]/90 backdrop-blur-[12px] font-display antialiased">
      {/* Modal Container */}
      <div className="relative w-full max-w-[340px] bg-[#162a2a] border border-[#234848]/50 rounded-2xl p-8 flex flex-col items-center text-center shadow-[0_0_40px_-10px_rgba(19,236,236,0.15)] overflow-hidden">
        {/* Decorative Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#13ecec]/5 to-transparent pointer-events-none"></div>

        {/* Icon */}
        <div className="relative mb-5 bg-[#102222] p-4 rounded-full border border-[#234848] shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="40"
            width="40"
            viewBox="0 -960 960 960"
            fill="#13ecec">
            <path d="M480-80q-73-9-145-39.5T206.5-207Q150-264 115-351T80-560v-40h40q51 0 105 13t101 39q12-86 54.5-176.5T480-880q57 65 99.5 155.5T634-548q47-26 101-39t105-13h40v40q0 122-35 209t-91.5 144q-56.5 57-128 87.5T480-80Zm-2-82q-11-166-98.5-251T162-518q11 171 101.5 255T478-162Zm2-254q15-22 36.5-45.5T558-502q-2-57-22.5-119T480-742q-35 59-55.5 121T402-502q20 17 42 40.5t36 45.5Zm78 236q37-12 77-35t74.5-62.5q34.5-39.5 59-98.5T798-518q-94 14-165 62.5T524-332q12 32 20.5 70t13.5 82Zm-78-236Zm78 236Zm-80 18Zm46-170ZM480-80Z" />
          </svg>
        </div>

        {/* Text Content */}
        <h2 className="text-white text-xl font-bold tracking-tight mb-3 relative z-10">
          {title}
        </h2>
        <p className="text-[#92c9c9] text-sm leading-relaxed mb-8 relative z-10 font-normal">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col w-full gap-3 relative z-10">
          {/* Primary Action: Close YouTube */}
          <button
            onClick={() => {
              // Redirect to a neutral page (Close tab isn't always allowed by Chrome)
              window.location.href = "https://www.google.com"
            }}
            className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-4 bg-[#13ecec] text-[#102222] text-sm font-bold leading-normal tracking-wide hover:bg-opacity-90 transition-opacity shadow-[0_0_15px_-3px_rgba(19,236,236,0.3)]">
            Close YouTube
          </button>

          {/* Secondary Action: 5 More Minutes (Only if not paused) */}
          {reason !== "paused" && (
            <button
              onClick={() => {
                const type =
                  reason === "shorts-limit"
                    ? "EXTEND_SHORTS_TIME"
                    : "EXTEND_TIME"
                chrome.runtime.sendMessage({ type })
              }}
              className="flex w-full items-center justify-center rounded-lg h-10 px-4 bg-transparent text-[#5c8a8a] hover:text-white text-sm font-medium transition-colors">
              5 more minutes
            </button>
          )}

          {/* If paused, allow Resume via popup logic? Actually the popup button handles resume. 
               The overlay just blocks interactivity. 
               Maybe add a "Resume" button here for convenience? User requirement says "resume restores previous state".
               But `isPaused` is toggled in Popup. Let's keep it simple.
            */}
        </div>
      </div>
    </div>
  )
}

export default Overlay
