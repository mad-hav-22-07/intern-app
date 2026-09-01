import type { SolutionSet } from './index'

/** Reference solutions for `src/data/problems/core.ts`. */
export const CORE_SOLUTIONS: Record<string, SolutionSet> = {
  'cp-pair-sum': {
    python: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, x in enumerate(nums):
            if target - x in seen:
                return [seen[target - x], i]
            if x not in seen:
                seen[x] = i
        return []
`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<long long,int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            long long need = (long long)target - nums[i];
            auto it = seen.find(need);
            if (it != seen.end()) return {it->second, i};
            if (!seen.count(nums[i])) seen[nums[i]] = i;
        }
        return {};
    }
};
`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        java.util.HashMap<Long,Integer> seen = new java.util.HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            long need = (long) target - nums[i];
            if (seen.containsKey(need)) return new int[]{seen.get(need), i};
            seen.putIfAbsent((long) nums[i], i);
        }
        return new int[0];
    }
}
`,
    javascript: `var twoSum = function (nums, target) {
  const seen = new Map()
  for (let i = 0; i < nums.length; i++) {
    if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i]
    if (!seen.has(nums[i])) seen.set(nums[i], i)
  }
  return []
}
`,
  },
  'cp-distinct-window': {
    python: `class Solution:
    def longestClean(self, s: str) -> int:
        last = {}
        L = 0
        best = 0
        for i, c in enumerate(s):
            if c in last and last[c] >= L:
                L = last[c] + 1
            last[c] = i
            best = max(best, i - L + 1)
        return best
`,
    cpp: `class Solution {
public:
    int longestClean(string s) {
        vector<int> last(256, -1);
        int L = 0, best = 0;
        for (int i = 0; i < (int)s.size(); i++) {
            unsigned char c = s[i];
            if (last[c] >= L) L = last[c] + 1;
            last[c] = i;
            best = max(best, i - L + 1);
        }
        return best;
    }
};
`,
    java: `class Solution {
    public int longestClean(String s) {
        int[] last = new int[256];
        java.util.Arrays.fill(last, -1);
        int L = 0, best = 0;
        for (int i = 0; i < s.length(); i++) {
            int c = s.charAt(i);
            if (last[c] >= L) L = last[c] + 1;
            last[c] = i;
            best = Math.max(best, i - L + 1);
        }
        return best;
    }
}
`,
    javascript: `var longestClean = function (s) {
  const last = new Map()
  let L = 0, best = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (last.has(c) && last.get(c) >= L) L = last.get(c) + 1
    last.set(c, i)
    best = Math.max(best, i - L + 1)
  }
  return best
}
`,
  },
  'cp-room-booking': {
    python: `from typing import List

class Solution:
    def maxBookings(self, bookings: List[List[int]]) -> int:
        bookings.sort(key=lambda p: p[1])
        cnt = 0
        end = -1
        for s, e in bookings:
            if s >= end:
                cnt += 1
                end = e
        return cnt
`,
    cpp: `class Solution {
public:
    int maxBookings(vector<vector<int>>& bookings) {
        sort(bookings.begin(), bookings.end(),
             [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });
        int cnt = 0;
        long long end = -1;
        for (auto& b : bookings) if (b[0] >= end) { cnt++; end = b[1]; }
        return cnt;
    }
};
`,
    java: `class Solution {
    public int maxBookings(int[][] bookings) {
        java.util.Arrays.sort(bookings, (a, b) -> Integer.compare(a[1], b[1]));
        int cnt = 0;
        long end = -1;
        for (int[] b : bookings) if (b[0] >= end) { cnt++; end = b[1]; }
        return cnt;
    }
}
`,
    javascript: `var maxBookings = function (bookings) {
  bookings.sort((a, b) => a[1] - b[1])
  let cnt = 0, end = -1
  for (const [s, e] of bookings) if (s >= end) { cnt++; end = e }
  return cnt
}
`,
  },
}
