/**
 * C# reference solutions for the five problems in `DEFAULT_SET`
 * (scripts/verify-driver.mts). These prove the driver, not the problems — the
 * expected values are already proven correct by the other four languages.
 *
 * The harness widens signature `int` to C# `long` (see the comment in
 * `src/lib/drivers/csharp.ts`), so every method below returns `long` even
 * where the underlying value is small. Method names are PascalCase to match
 * `src/lib/drivers/csharp.ts`'s call site.
 *
 * Fully-qualified names (`System.Collections.Generic.Dictionary<...>` etc.)
 * are used instead of extra `using` directives, since these snippets are
 * spliced into the driver file after its own `using System;` /
 * `System.Globalization` / `System.Diagnostics` block and nothing else.
 */
export const SOLUTIONS: Record<string, string> = {
  // int[], int -> int[]
  'cp-pair-sum': `public class Solution {
    public int[] TwoSum(int[] nums, long target) {
        var seen = new System.Collections.Generic.Dictionary<long, int>();
        for (int i = 0; i < nums.Length; i++) {
            long need = target - nums[i];
            int idx;
            if (seen.TryGetValue(need, out idx)) {
                return new int[] { idx, i };
            }
            seen[(long) nums[i]] = i;
        }
        return new int[0];
    }
}
`,

  // string -> int
  'cp-distinct-window': `public class Solution {
    public long LongestClean(string s) {
        var last = new System.Collections.Generic.Dictionary<char, int>();
        int left = 0;
        long best = 0;
        for (int right = 0; right < s.Length; right++) {
            char c = s[right];
            int prev;
            if (last.TryGetValue(c, out prev) && prev >= left) {
                left = prev + 1;
            }
            last[c] = right;
            long len = right - left + 1;
            if (len > best) best = len;
        }
        return best;
    }
}
`,

  // int[][] -> int
  'cp-room-booking': `public class Solution {
    public long MaxBookings(int[][] bookings) {
        int n = bookings.Length;
        int[][] arr = (int[][]) bookings.Clone();
        System.Array.Sort(arr, (a, b) => a[1].CompareTo(b[1]));
        long count = 0;
        long lastEnd = long.MinValue;
        for (int i = 0; i < n; i++) {
            if (arr[i][0] >= lastEnd) {
                count++;
                lastEnd = arr[i][1];
            }
        }
        return count;
    }
}
`,

  // int[] -> int
  'cp-ar-class-president': `public class Solution {
    public long President(int[] votes) {
        int candidate = 0;
        int count = 0;
        for (int i = 0; i < votes.Length; i++) {
            if (count == 0) candidate = votes[i];
            count += votes[i] == candidate ? 1 : -1;
        }
        return candidate;
    }
}
`,

  // int[][] -> int
  'cp-gr-land-blocks': `public class Solution {
    public long CountLandBlocks(int[][] field) {
        int rows = field.Length;
        if (rows == 0) return 0;
        int cols = field[0].Length;
        bool[,] visited = new bool[rows, cols];
        long count = 0;
        int[] dr = new int[] { -1, 1, 0, 0 };
        int[] dc = new int[] { 0, 0, -1, 1 };
        var queue = new System.Collections.Generic.Queue<int[]>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (field[r][c] == 1 && !visited[r, c]) {
                    count++;
                    visited[r, c] = true;
                    queue.Enqueue(new int[] { r, c });
                    while (queue.Count > 0) {
                        int[] cur = queue.Dequeue();
                        for (int d = 0; d < 4; d++) {
                            int nr = cur[0] + dr[d];
                            int nc = cur[1] + dc[d];
                            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && field[nr][nc] == 1 && !visited[nr, nc]) {
                                visited[nr, nc] = true;
                                queue.Enqueue(new int[] { nr, nc });
                            }
                        }
                    }
                }
            }
        }
        return count;
    }
}
`,
}
