/**
 * Link builder for the "being built" page.
 *
 * `feature` names the thing that is missing so the page can be specific, and
 * `from` is where the Back button should return to.
 */
export function comingSoon(feature: string, from: string): string {
  const params = new URLSearchParams({ feature, from })
  return `/coming-soon?${params.toString()}`
}
