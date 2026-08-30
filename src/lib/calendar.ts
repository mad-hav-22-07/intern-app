import type { Competition } from '@/data/competitions'

/**
 * Calendar export. Both formats are real — the .ics opens in Apple Calendar and
 * Outlook, and the Google link opens a pre-filled event — so "my calendar" is
 * something the user can actually leave the app with.
 */

const DEFAULT_MINS = 60

function stamp(iso: string): string {
  // ICS basic format, always UTC: 20260906T023000Z
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function endOf(c: Competition): string {
  const start = Date.parse(c.startsAt)
  return new Date(start + (c.durationMins ?? DEFAULT_MINS) * 60_000).toISOString()
}

/** RFC 5545 wants CRLF line breaks and escaped separators. */
function escape(text: string): string {
  return text.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
}

export function toIcs(comps: Competition[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Internship Prep Drive//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Internship Prep Drive',
  ]

  for (const c of comps) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${c.id}@internship-prep-drive`,
      `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(c.startsAt)}`,
      `DTEND:${stamp(endOf(c))}`,
      `SUMMARY:${escape(c.title)}`,
      `DESCRIPTION:${escape(
        [c.org, c.timeLabel, c.prize && `Prize: ${c.prize}`, c.team, c.url]
          .filter(Boolean)
          .join(' · '),
      )}`,
      ...(c.url ? [`URL:${c.url}`] : []),
      // One reminder the evening before, one an hour ahead.
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escape(`Tomorrow: ${c.title}`)}`,
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escape(`Starting soon: ${c.title}`)}`,
      'END:VALARM',
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadIcs(comps: Competition[], fileName = 'internship-prep-drive.ics') {
  const blob = new Blob([toIcs(comps)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 2_000)
}

/** Opens Google Calendar's "add event" screen with everything pre-filled. */
export function googleCalendarUrl(c: Competition): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: c.title,
    dates: `${stamp(c.startsAt)}/${stamp(endOf(c))}`,
    details: [c.org, c.timeLabel, c.prize && `Prize: ${c.prize}`, c.url]
      .filter(Boolean)
      .join('\n'),
    location: c.url ?? 'IIT Madras',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
