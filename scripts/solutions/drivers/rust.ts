/**
 * Rust reference solutions for the five problems `verify-driver.mts`
 * exercises by default. Each is an `impl Solution { ... }` block, matching
 * the shape `rustStarter` in `src/lib/drivers/rust.ts` generates — the
 * driver supplies `struct Solution;` itself, so these do not repeat it.
 */
export const SOLUTIONS: Record<string, string> = {
  'cp-pair-sum': `impl Solution {
    pub fn two_sum(nums: Vec<i64>, target: i64) -> Vec<i64> {
        use std::collections::HashMap;
        let mut seen: HashMap<i64, i64> = HashMap::new();
        for (i, &v) in nums.iter().enumerate() {
            let need = target - v;
            if let Some(&j) = seen.get(&need) {
                return vec![j, i as i64];
            }
            seen.insert(v, i as i64);
        }
        Vec::new()
    }
}
`,
  'cp-distinct-window': `impl Solution {
    pub fn longest_clean(s: String) -> i64 {
        let bytes = s.as_bytes();
        let mut last = [-1i64; 26];
        let mut start = 0i64;
        let mut best = 0i64;
        for (idx, &b) in bytes.iter().enumerate() {
            let c = (b - b'a') as usize;
            let i = idx as i64;
            if last[c] >= start {
                start = last[c] + 1;
            }
            last[c] = i;
            let len = i - start + 1;
            if len > best {
                best = len;
            }
        }
        best
    }
}
`,
  'cp-room-booking': `impl Solution {
    pub fn max_bookings(mut bookings: Vec<Vec<i64>>) -> i64 {
        bookings.sort_by(|a, b| a[1].cmp(&b[1]));
        let mut count = 0i64;
        let mut last_end = i64::MIN;
        for b in bookings.iter() {
            if b[0] >= last_end {
                count += 1;
                last_end = b[1];
            }
        }
        count
    }
}
`,
  'cp-ar-class-president': `impl Solution {
    pub fn president(votes: Vec<i64>) -> i64 {
        let mut candidate = 0i64;
        let mut count = 0i64;
        for &v in votes.iter() {
            if count == 0 {
                candidate = v;
            }
            count += if v == candidate { 1 } else { -1 };
        }
        candidate
    }
}
`,
  'cp-gr-land-blocks': `impl Solution {
    pub fn count_land_blocks(field: Vec<Vec<i64>>) -> i64 {
        let rows = field.len();
        if rows == 0 {
            return 0;
        }
        let cols = field[0].len();
        let mut visited = vec![vec![false; cols]; rows];
        let mut count = 0i64;
        for r in 0..rows {
            for c in 0..cols {
                if field[r][c] == 1 && !visited[r][c] {
                    count += 1;
                    let mut stack = vec![(r, c)];
                    visited[r][c] = true;
                    while let Some((cr, cc)) = stack.pop() {
                        let neighbors = [
                            (cr as i64 - 1, cc as i64),
                            (cr as i64 + 1, cc as i64),
                            (cr as i64, cc as i64 - 1),
                            (cr as i64, cc as i64 + 1),
                        ];
                        for (nr, nc) in neighbors {
                            if nr >= 0 && nc >= 0 && (nr as usize) < rows && (nc as usize) < cols {
                                let nr = nr as usize;
                                let nc = nc as usize;
                                if field[nr][nc] == 1 && !visited[nr][nc] {
                                    visited[nr][nc] = true;
                                    stack.push((nr, nc));
                                }
                            }
                        }
                    }
                }
            }
        }
        count
    }
}
`,
}
