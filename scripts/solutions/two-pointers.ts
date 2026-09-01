import type { SolutionSet } from './index'

/** Reference solutions for `src/data/problems/two-pointers.ts`. */
export const TWO_POINTER_SOLUTIONS: Record<string, SolutionSet> = {
  'cp-tp-mirror-message': {
    python: `class Solution:
    def readsSame(self, s: str) -> bool:
        i, j = 0, len(s) - 1
        while i < j:
            while i < j and not s[i].isalnum():
                i += 1
            while i < j and not s[j].isalnum():
                j -= 1
            if s[i].lower() != s[j].lower():
                return False
            i += 1
            j -= 1
        return True
`,
    cpp: `class Solution {
public:
    bool readsSame(string s) {
        int i = 0, j = (int)s.size() - 1;
        auto isAlnumC = [](unsigned char c) { return isalnum(c) != 0; };
        while (i < j) {
            while (i < j && !isAlnumC(s[i])) i++;
            while (i < j && !isAlnumC(s[j])) j--;
            if (tolower((unsigned char)s[i]) != tolower((unsigned char)s[j])) return false;
            i++;
            j--;
        }
        return true;
    }
};
`,
    java: `class Solution {
    public boolean readsSame(String s) {
        int i = 0, j = s.length() - 1;
        while (i < j) {
            while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
            while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
            if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) return false;
            i++;
            j--;
        }
        return true;
    }
}
`,
    javascript: `var readsSame = function (s) {
  const isAlnum = (c) => /[a-zA-Z0-9]/.test(c)
  let i = 0, j = s.length - 1
  while (i < j) {
    while (i < j && !isAlnum(s[i])) i++
    while (i < j && !isAlnum(s[j])) j--
    if (s[i].toLowerCase() !== s[j].toLowerCase()) return false
    i++
    j--
  }
  return true
}
`,
  },
  'cp-tp-canal-dam': {
    python: `from typing import List

class Solution:
    def maxCanalVolume(self, heights: List[int]) -> int:
        i, j = 0, len(heights) - 1
        best = 0
        while i < j:
            best = max(best, min(heights[i], heights[j]) * (j - i))
            if heights[i] < heights[j]:
                i += 1
            else:
                j -= 1
        return best
`,
    cpp: `class Solution {
public:
    int maxCanalVolume(vector<int>& heights) {
        int i = 0, j = (int)heights.size() - 1;
        long long best = 0;
        while (i < j) {
            long long area = (long long)min(heights[i], heights[j]) * (j - i);
            best = max(best, area);
            if (heights[i] < heights[j]) i++;
            else j--;
        }
        return (int)best;
    }
};
`,
    java: `class Solution {
    public int maxCanalVolume(int[] heights) {
        int i = 0, j = heights.length - 1;
        long best = 0;
        while (i < j) {
            long area = (long) Math.min(heights[i], heights[j]) * (j - i);
            best = Math.max(best, area);
            if (heights[i] < heights[j]) i++;
            else j--;
        }
        return (int) best;
    }
}
`,
    javascript: `var maxCanalVolume = function (heights) {
  let i = 0, j = heights.length - 1, best = 0
  while (i < j) {
    best = Math.max(best, Math.min(heights[i], heights[j]) * (j - i))
    if (heights[i] < heights[j]) i++
    else j--
  }
  return best
}
`,
  },
  'cp-tp-balanced-triples': {
    python: `from typing import List

class Solution:
    def countZeroTriples(self, nums: List[int]) -> int:
        a = sorted(nums)
        n = len(a)
        count = 0
        for i in range(n - 2):
            if i > 0 and a[i] == a[i - 1]:
                continue
            lo, hi = i + 1, n - 1
            while lo < hi:
                s = a[i] + a[lo] + a[hi]
                if s == 0:
                    count += 1
                    lv, hv = a[lo], a[hi]
                    while lo < hi and a[lo] == lv:
                        lo += 1
                    while lo < hi and a[hi] == hv:
                        hi -= 1
                elif s < 0:
                    lo += 1
                else:
                    hi -= 1
        return count
`,
    cpp: `class Solution {
public:
    int countZeroTriples(vector<int>& nums) {
        vector<int> a = nums;
        sort(a.begin(), a.end());
        int n = (int)a.size();
        int count = 0;
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && a[i] == a[i - 1]) continue;
            int lo = i + 1, hi = n - 1;
            while (lo < hi) {
                long long s = (long long)a[i] + a[lo] + a[hi];
                if (s == 0) {
                    count++;
                    int lv = a[lo], hv = a[hi];
                    while (lo < hi && a[lo] == lv) lo++;
                    while (lo < hi && a[hi] == hv) hi--;
                } else if (s < 0) {
                    lo++;
                } else {
                    hi--;
                }
            }
        }
        return count;
    }
};
`,
    java: `class Solution {
    public int countZeroTriples(int[] nums) {
        int[] a = nums.clone();
        java.util.Arrays.sort(a);
        int n = a.length;
        int count = 0;
        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && a[i] == a[i - 1]) continue;
            int lo = i + 1, hi = n - 1;
            while (lo < hi) {
                long s = (long) a[i] + a[lo] + a[hi];
                if (s == 0) {
                    count++;
                    int lv = a[lo], hv = a[hi];
                    while (lo < hi && a[lo] == lv) lo++;
                    while (lo < hi && a[hi] == hv) hi--;
                } else if (s < 0) {
                    lo++;
                } else {
                    hi--;
                }
            }
        }
        return count;
    }
}
`,
    javascript: `var countZeroTriples = function (nums) {
  const a = [...nums].sort((x, y) => x - y)
  const n = a.length
  let count = 0
  for (let i = 0; i < n - 2; i++) {
    if (i > 0 && a[i] === a[i - 1]) continue
    let lo = i + 1, hi = n - 1
    while (lo < hi) {
      const s = a[i] + a[lo] + a[hi]
      if (s === 0) {
        count++
        const lv = a[lo], hv = a[hi]
        while (lo < hi && a[lo] === lv) lo++
        while (lo < hi && a[hi] === hv) hi--
      } else if (s < 0) lo++
      else hi--
    }
  }
  return count
}
`,
  },
  'cp-tp-budget-repaint': {
    python: `class Solution:
    def longestUniform(self, s: str, k: int) -> int:
        count = {}
        left = 0
        max_count = 0
        best = 0
        for right, c in enumerate(s):
            count[c] = count.get(c, 0) + 1
            max_count = max(max_count, count[c])
            while (right - left + 1) - max_count > k:
                count[s[left]] -= 1
                left += 1
            best = max(best, right - left + 1)
        return best
`,
    cpp: `class Solution {
public:
    int longestUniform(string s, int k) {
        int count[26] = {0};
        int left = 0, maxCount = 0, best = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            count[s[right] - 'A']++;
            maxCount = max(maxCount, count[s[right] - 'A']);
            while ((right - left + 1) - maxCount > k) {
                count[s[left] - 'A']--;
                left++;
            }
            best = max(best, right - left + 1);
        }
        return best;
    }
};
`,
    java: `class Solution {
    public int longestUniform(String s, int k) {
        int[] count = new int[26];
        int left = 0, maxCount = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            int c = s.charAt(right) - 'A';
            count[c]++;
            maxCount = Math.max(maxCount, count[c]);
            while ((right - left + 1) - maxCount > k) {
                count[s.charAt(left) - 'A']--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
`,
    javascript: `var longestUniform = function (s, k) {
  const count = new Array(26).fill(0)
  let left = 0, maxCount = 0, best = 0
  for (let right = 0; right < s.length; right++) {
    const c = s.charCodeAt(right) - 65
    count[c]++
    maxCount = Math.max(maxCount, count[c])
    while ((right - left + 1) - maxCount > k) {
      count[s.charCodeAt(left) - 65]--
      left++
    }
    best = Math.max(best, right - left + 1)
  }
  return best
}
`,
  },
  'cp-tp-rain-basin': {
    python: `from typing import List

class Solution:
    def trapWater(self, heights: List[int]) -> int:
        i, j = 0, len(heights) - 1
        left_max = right_max = 0
        total = 0
        while i < j:
            if heights[i] <= heights[j]:
                left_max = max(left_max, heights[i])
                total += left_max - heights[i]
                i += 1
            else:
                right_max = max(right_max, heights[j])
                total += right_max - heights[j]
                j -= 1
        return total
`,
    cpp: `class Solution {
public:
    int trapWater(vector<int>& heights) {
        int i = 0, j = (int)heights.size() - 1;
        int leftMax = 0, rightMax = 0;
        long long total = 0;
        while (i < j) {
            if (heights[i] <= heights[j]) {
                leftMax = max(leftMax, heights[i]);
                total += leftMax - heights[i];
                i++;
            } else {
                rightMax = max(rightMax, heights[j]);
                total += rightMax - heights[j];
                j--;
            }
        }
        return (int)total;
    }
};
`,
    java: `class Solution {
    public int trapWater(int[] heights) {
        int i = 0, j = heights.length - 1;
        int leftMax = 0, rightMax = 0;
        long total = 0;
        while (i < j) {
            if (heights[i] <= heights[j]) {
                leftMax = Math.max(leftMax, heights[i]);
                total += leftMax - heights[i];
                i++;
            } else {
                rightMax = Math.max(rightMax, heights[j]);
                total += rightMax - heights[j];
                j--;
            }
        }
        return (int) total;
    }
}
`,
    javascript: `var trapWater = function (heights) {
  let i = 0, j = heights.length - 1
  let leftMax = 0, rightMax = 0, total = 0
  while (i < j) {
    if (heights[i] <= heights[j]) {
      leftMax = Math.max(leftMax, heights[i])
      total += leftMax - heights[i]
      i++
    } else {
      rightMax = Math.max(rightMax, heights[j])
      total += rightMax - heights[j]
      j--
    }
  }
  return total
}
`,
  },
}
