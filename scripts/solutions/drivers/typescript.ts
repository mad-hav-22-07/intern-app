/**
 * Reference TypeScript solutions for `scripts/verify-driver.mts`'s DEFAULT_SET.
 * Only these five problems need a solution here — see the header comment in
 * verify-driver.mts for why five is enough.
 */
export const SOLUTIONS: Record<string, string> = {
  'cp-pair-sum': `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    if (seen.has(need)) return [seen.get(need)!, i]
    if (!seen.has(nums[i])) seen.set(nums[i], i)
  }
  return []
}
`,

  'cp-distinct-window': `function longestClean(s: string): number {
  const last = new Map<string, number>()
  let L = 0
  let best = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (last.has(c) && last.get(c)! >= L) L = last.get(c)! + 1
    last.set(c, i)
    best = Math.max(best, i - L + 1)
  }
  return best
}
`,

  'cp-room-booking': `function maxBookings(bookings: number[][]): number {
  const sorted = [...bookings].sort((a, b) => a[1] - b[1])
  let count = 0
  let end = -Infinity
  for (const b of sorted) {
    if (b[0] >= end) {
      count++
      end = b[1]
    }
  }
  return count
}
`,

  'cp-ar-class-president': `function president(votes: number[]): number {
  let candidate = 0
  let count = 0
  for (const v of votes) {
    if (count === 0) candidate = v
    count += v === candidate ? 1 : -1
  }
  return candidate
}
`,

  'cp-gr-land-blocks': `function countLandBlocks(field: number[][]): number {
  const rows = field.length
  const cols = rows > 0 ? field[0].length : 0
  const seen: boolean[][] = Array.from({ length: rows }, () => new Array(cols).fill(false))
  let count = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (field[r][c] === 1 && !seen[r][c]) {
        count++
        const queue: [number, number][] = [[r, c]]
        seen[r][c] = true
        while (queue.length > 0) {
          const cell = queue.pop() as [number, number]
          const cr = cell[0]
          const cc = cell[1]
          const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]]
          for (const d of dirs) {
            const nr = cr + d[0]
            const nc = cc + d[1]
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && field[nr][nc] === 1 && !seen[nr][nc]) {
              seen[nr][nc] = true
              queue.push([nr, nc])
            }
          }
        }
      }
    }
  }
  return count
}
`,
}
