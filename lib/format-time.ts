/**
 * All audition times are displayed in the rush timezone, regardless of where
 * the code runs. Server Components render in the deploy region's timezone
 * (UTC on Vercel) while Client Components render in the browser's, so relying
 * on the ambient timezone made the same slot show different times on the
 * dashboard and the schedule page.
 */
export const AUDITION_TIME_ZONE = 'America/New_York'

const timeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: AUDITION_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
})

const shortDateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: AUDITION_TIME_ZONE,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const longDateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: AUDITION_TIME_ZONE,
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

const shortDateTimeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: AUDITION_TIME_ZONE,
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** "09:00 AM" for a TIMESTAMPTZ value (e.g. audition_slots.start_time). */
export function formatSlotTime(timestamp: string): string {
  return timeFmt.format(new Date(timestamp))
}

/** "Mon, Sep 8" for a TIMESTAMPTZ value. */
export function formatSlotDate(timestamp: string): string {
  return shortDateFmt.format(new Date(timestamp))
}

/** "Sep 8, 09:00 AM" for a TIMESTAMPTZ value. */
export function formatSlotDateTime(timestamp: string): string {
  return shortDateTimeFmt.format(new Date(timestamp))
}

/** "Monday, September 8" for a DATE value ("YYYY-MM-DD"). */
export function formatBlockDate(date: string): string {
  // Date-only values carry no timezone. Anchor at midday UTC so the calendar
  // day is the same in the audition timezone no matter the runtime's offset.
  return longDateFmt.format(new Date(`${date}T12:00:00Z`))
}

/** "09:00 AM" for a DATE-less TIME value ("HH:MM:SS"). */
export function formatWallClockTime(time: string): string {
  const [hour, minute] = time.split(':')
  const d = new Date(Date.UTC(1970, 0, 1, Number(hour), Number(minute)))
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
