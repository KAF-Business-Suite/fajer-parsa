/** Local dates in Afghanistan, including for visitors in other time zones. */
export function todayInKabul(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kabul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return values.year + '-' + values.month + '-' + values.day
}
