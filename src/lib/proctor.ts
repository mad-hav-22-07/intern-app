import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Fullscreen + focus proctoring.
 *
 * Everything here is real, unlike the decorative "proctoring active" badge on the
 * MCQ paper. The browser genuinely cannot tell you *what* is on the other tab, so
 * what is enforceable is exactly three things: whether the document is in
 * fullscreen, whether it is the visible tab, and whether the window has focus.
 * Those are counted honestly and shown to the student, who then knows the count
 * is going into the report.
 *
 * The `requestFullscreen` call has to happen inside a user gesture, which is why
 * `enter` is returned for a button to call rather than fired from an effect.
 * iPhone Safari has no element fullscreen at all; `supported` is false there and
 * the round runs windowed with the exit counter simply never incrementing.
 */

export type ProctorState = {
  supported: boolean
  fullscreen: boolean
  /** Times the tab was hidden or the window lost focus while the clock ran. */
  tabSwitches: number
  /** Times fullscreen was left while the clock ran. */
  fullscreenExits: number
  /** Paste attempts refused by the editor. */
  blockedPastes: number
  enter: () => Promise<boolean>
  leave: () => void
  countBlockedPaste: () => void
  reset: () => void
}

function isFullscreen() {
  return typeof document !== 'undefined' && !!document.fullscreenElement
}

export function useProctor(active: boolean): ProctorState {
  const supported =
    typeof document !== 'undefined' &&
    typeof document.documentElement.requestFullscreen === 'function'

  const [fullscreen, setFullscreen] = useState(isFullscreen)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [fullscreenExits, setFullscreenExits] = useState(0)
  const [blockedPastes, setBlockedPastes] = useState(0)

  // Read inside listeners so they can stay mounted for the life of the round.
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const onFsChange = () => {
      const now = isFullscreen()
      setFullscreen(now)
      if (!now && activeRef.current) setFullscreenExits((n) => n + 1)
    }
    // A hidden tab and a blurred window are different events, and a normal
    // alt-tab fires both. Counting once per *hide* is the honest reading.
    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && activeRef.current) setTabSwitches((n) => n + 1)
    }

    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const enter = useCallback(async () => {
    if (!supported) return false
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      // Resolving is not the same as being in fullscreen; ask the document.
      return isFullscreen()
    } catch {
      // Denied by policy, or the gesture had already expired.
      return isFullscreen()
    }
  }, [supported])

  const leave = useCallback(() => {
    if (isFullscreen()) document.exitFullscreen().catch(() => {})
  }, [])

  const reset = useCallback(() => {
    setTabSwitches(0)
    setFullscreenExits(0)
    setBlockedPastes(0)
  }, [])

  const countBlockedPaste = useCallback(() => setBlockedPastes((n) => n + 1), [])

  // Never strand the user in a fullscreen page after the round unmounts.
  useEffect(() => () => { if (isFullscreen()) document.exitFullscreen().catch(() => {}) }, [])

  return {
    supported,
    fullscreen,
    tabSwitches,
    fullscreenExits,
    blockedPastes,
    enter,
    leave,
    countBlockedPaste,
    reset,
  }
}
