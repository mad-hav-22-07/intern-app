/**
 * Go reference solutions for the five problems `verify-driver.mts` exercises
 * by default. Each is a plain package-level function, matching the shape
 * `goStarter` in `src/lib/drivers/go.ts` generates.
 */
export const SOLUTIONS: Record<string, string> = {
  'cp-pair-sum': `func twoSum(nums []int, target int) []int {
	seen := make(map[int]int, len(nums))
	for i, x := range nums {
		if j, ok := seen[target-x]; ok {
			return []int{j, i}
		}
		if _, ok := seen[x]; !ok {
			seen[x] = i
		}
	}
	return []int{}
}
`,
  'cp-distinct-window': `func longestClean(s string) int {
	last := make(map[byte]int)
	best, left := 0, 0
	for right := 0; right < len(s); right++ {
		c := s[right]
		if p, ok := last[c]; ok && p >= left {
			left = p + 1
		}
		last[c] = right
		if right-left+1 > best {
			best = right - left + 1
		}
	}
	return best
}
`,
  'cp-room-booking': `import "sort"

func maxBookings(bookings [][]int) int {
	sort.Slice(bookings, func(i, j int) bool {
		return bookings[i][1] < bookings[j][1]
	})
	count := 0
	end := -1 << 62
	for _, b := range bookings {
		if b[0] >= end {
			count++
			end = b[1]
		}
	}
	return count
}
`,
  'cp-ar-class-president': `func president(votes []int) int {
	candidate, count := 0, 0
	for _, v := range votes {
		if count == 0 {
			candidate = v
		}
		if v == candidate {
			count++
		} else {
			count--
		}
	}
	return candidate
}
`,
  'cp-gr-land-blocks': `func countLandBlocks(field [][]int) int {
	if len(field) == 0 {
		return 0
	}
	rows, cols := len(field), len(field[0])
	seen := make([][]bool, rows)
	for i := range seen {
		seen[i] = make([]bool, cols)
	}
	var stack [][2]int
	blocks := 0
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if field[r][c] != 1 || seen[r][c] {
				continue
			}
			blocks++
			seen[r][c] = true
			stack = append(stack, [2]int{r, c})
			for len(stack) > 0 {
				cur := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				dirs := [4][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
				for _, d := range dirs {
					nr, nc := cur[0]+d[0], cur[1]+d[1]
					if nr >= 0 && nr < rows && nc >= 0 && nc < cols && field[nr][nc] == 1 && !seen[nr][nc] {
						seen[nr][nc] = true
						stack = append(stack, [2]int{nr, nc})
					}
				}
			}
		}
	}
	return blocks
}
`,
}
