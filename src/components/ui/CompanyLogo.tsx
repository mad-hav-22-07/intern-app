import { useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * A company's logo, with initials when there isn't one.
 *
 * Logos come from Google's favicon service, keyed on the domain recorded in
 * `data/companyMeta`. That is a deliberate trade with two things worth knowing:
 *
 * - **It fails often enough to matter.** Some firms in the Blue Book are small
 *   Indian prop shops whose domain has no usable icon, and the service answers
 *   either a 404 or a generic globe. So the fallback is not an edge case, it is
 *   a normal state, and it has to look like a designed thing rather than a
 *   broken image. Hence initials on a tinted tile.
 * - **It tells Google which companies are on the page.** Company names are the
 *   least sensitive part of this data — the stipends and the student feedback
 *   are the parts under the confidentiality notice, and those never leave the
 *   browser — but it is a third-party request on an authenticated page, so it is
 *   a conscious choice rather than an accident. Drop `domain` from the metadata
 *   for a company and it silently falls back to initials.
 */

/** "Boston Consulting Group" -> "BC"; "Adobe" -> "Ad". */
function initialsOf(name: string) {
  const words = name
    .replace(/[()]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !/^(the|and|&|pvt|private|limited|ltd|inc|llp|india)$/i.test(w))
  if (!words.length) return name.slice(0, 2).toUpperCase()
  if (words.length === 1) return words[0].slice(0, 2)
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function CompanyLogo({
  name,
  domain,
  size = 40,
  className,
}: {
  name: string
  domain?: string
  /** Rendered box in px. The icon is fetched at 128 and downscaled, so it stays crisp. */
  size?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const showImage = !!domain && !failed

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-surface',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          // Decorative: the company name is always rendered next to it, so a
          // screen reader announcing the logo too would just be noise.
          aria-hidden
          onError={() => setFailed(true)}
          className="size-full object-contain p-1.5"
        />
      ) : (
        <span
          className="font-semibold text-accent"
          style={{ fontSize: Math.max(10, Math.round(size * 0.34)) }}
          aria-hidden
        >
          {initialsOf(name)}
        </span>
      )}
    </span>
  )
}
