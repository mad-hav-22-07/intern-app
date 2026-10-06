import type { SolutionSet } from './index'

/** Reference solutions for `src/data/problems/search-stack.ts`. */
export const SEARCH_SOLUTIONS: Record<string, SolutionSet> = {
  'cp-se-first-fit-bin': {
    python: `from typing import List

class Solution:
    def firstFit(self, capacities: List[int], weight: int) -> int:
        lo, hi = 0, len(capacities)
        while lo < hi:
            mid = (lo + hi) // 2
            if capacities[mid] >= weight:
                hi = mid
            else:
                lo = mid + 1
        return lo if lo < len(capacities) else -1
`,
    cpp: `class Solution {
public:
    int firstFit(vector<int>& capacities, int weight) {
        int lo = 0, hi = (int) capacities.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (capacities[mid] >= weight) hi = mid; else lo = mid + 1;
        }
        return lo < (int) capacities.size() ? lo : -1;
    }
};
`,
    java: `class Solution {
    public int firstFit(int[] capacities, int weight) {
        int lo = 0, hi = capacities.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (capacities[mid] >= weight) hi = mid; else lo = mid + 1;
        }
        return lo < capacities.length ? lo : -1;
    }
}
`,
    javascript: `var firstFit = function (capacities, weight) {
  let lo = 0, hi = capacities.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (capacities[mid] >= weight) hi = mid; else lo = mid + 1
  }
  return lo < capacities.length ? lo : -1
}
`,
  },
  'cp-se-conveyor-load': {
    python: `from typing import List

class Solution:
    def minCapacity(self, parcels: List[int], days: int) -> int:
        def runsNeeded(cap: int) -> int:
            runs, cur = 1, 0
            for w in parcels:
                if cur + w > cap:
                    runs += 1
                    cur = w
                else:
                    cur += w
            return runs

        lo, hi = max(parcels), sum(parcels)
        while lo < hi:
            mid = (lo + hi) // 2
            if runsNeeded(mid) <= days:
                hi = mid
            else:
                lo = mid + 1
        return lo
`,
    cpp: `class Solution {
public:
    int minCapacity(vector<int>& parcels, int days) {
        long long lo = 0, hi = 0;
        for (int w : parcels) { lo = max(lo, (long long) w); hi += w; }
        auto runsNeeded = [&](long long cap) {
            long long runs = 1, cur = 0;
            for (int w : parcels) {
                if (cur + w > cap) { runs++; cur = w; } else cur += w;
            }
            return runs;
        };
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2;
            if (runsNeeded(mid) <= days) hi = mid; else lo = mid + 1;
        }
        return (int) lo;
    }
};
`,
    java: `class Solution {
    public int minCapacity(int[] parcels, int days) {
        long lo = 0, hi = 0;
        for (int w : parcels) { lo = Math.max(lo, w); hi += w; }
        while (lo < hi) {
            long mid = lo + (hi - lo) / 2;
            if (runsNeeded(parcels, mid) <= days) hi = mid; else lo = mid + 1;
        }
        return (int) lo;
    }

    private long runsNeeded(int[] parcels, long cap) {
        long runs = 1, cur = 0;
        for (int w : parcels) {
            if (cur + w > cap) { runs++; cur = w; } else cur += w;
        }
        return runs;
    }
}
`,
    javascript: `var minCapacity = function (parcels, days) {
  const runsNeeded = (cap) => {
    let runs = 1, cur = 0
    for (const w of parcels) {
      if (cur + w > cap) { runs++; cur = w } else cur += w
    }
    return runs
  }
  let lo = Math.max(...parcels), hi = parcels.reduce((a, b) => a + b, 0)
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (runsNeeded(mid) <= days) hi = mid; else lo = mid + 1
  }
  return lo
}
`,
  },
  'cp-se-next-livelier-day': {
    python: `from typing import List

class Solution:
    def waitForLouder(self, decibels: List[int]) -> List[int]:
        n = len(decibels)
        res = [0] * n
        stack = []
        for i, d in enumerate(decibels):
            while stack and decibels[stack[-1]] < d:
                j = stack.pop()
                res[j] = i - j
            stack.append(i)
        return res
`,
    cpp: `class Solution {
public:
    vector<int> waitForLouder(vector<int>& decibels) {
        int n = (int) decibels.size();
        vector<int> res(n, 0);
        vector<int> stack;
        for (int i = 0; i < n; i++) {
            while (!stack.empty() && decibels[stack.back()] < decibels[i]) {
                int j = stack.back();
                stack.pop_back();
                res[j] = i - j;
            }
            stack.push_back(i);
        }
        return res;
    }
};
`,
    java: `class Solution {
    public int[] waitForLouder(int[] decibels) {
        int n = decibels.length;
        int[] res = new int[n];
        int[] stack = new int[n];
        int top = -1;
        for (int i = 0; i < n; i++) {
            while (top >= 0 && decibels[stack[top]] < decibels[i]) {
                int j = stack[top--];
                res[j] = i - j;
            }
            stack[++top] = i;
        }
        return res;
    }
}
`,
    javascript: `var waitForLouder = function (decibels) {
  const n = decibels.length
  const res = new Array(n).fill(0)
  const stack = []
  for (let i = 0; i < n; i++) {
    while (stack.length && decibels[stack[stack.length - 1]] < decibels[i]) {
      const j = stack.pop()
      res[j] = i - j
    }
    stack.push(i)
  }
  return res
}
`,
  },
  'cp-se-kth-topper': {
    python: `import heapq
from typing import List

class Solution:
    def kthTopper(self, scores: List[int], k: int) -> int:
        heap = []
        for s in scores:
            heapq.heappush(heap, s)
            if len(heap) > k:
                heapq.heappop(heap)
        return heap[0]
`,
    cpp: `class Solution {
public:
    int kthTopper(vector<int>& scores, int k) {
        priority_queue<int, vector<int>, greater<int>> heap;
        for (int s : scores) {
            heap.push(s);
            if ((int) heap.size() > k) heap.pop();
        }
        return heap.top();
    }
};
`,
    java: `class Solution {
    public int kthTopper(int[] scores, int k) {
        java.util.PriorityQueue<Integer> heap = new java.util.PriorityQueue<>();
        for (int s : scores) {
            heap.offer(s);
            if (heap.size() > k) heap.poll();
        }
        return heap.peek();
    }
}
`,
    javascript: `var kthTopper = function (scores, k) {
  const sorted = [...scores].sort((a, b) => b - a)
  return sorted[k - 1]
}
`,
  },
  'cp-se-widest-shelf-span': {
    python: `from typing import List

class Solution:
    def maxPanelArea(self, heights: List[int]) -> int:
        stack = []
        best = 0
        n = len(heights)
        for i in range(n + 1):
            h = heights[i] if i < n else 0
            while stack and heights[stack[-1]] >= h:
                height = heights[stack.pop()]
                width = i - stack[-1] - 1 if stack else i
                best = max(best, height * width)
            stack.append(i)
        return best
`,
    cpp: `class Solution {
public:
    int maxPanelArea(vector<int>& heights) {
        vector<int> stack;
        long long best = 0;
        int n = (int) heights.size();
        for (int i = 0; i <= n; i++) {
            int h = i < n ? heights[i] : 0;
            while (!stack.empty() && heights[stack.back()] >= h) {
                int height = heights[stack.back()];
                stack.pop_back();
                long long width = stack.empty() ? i : i - stack.back() - 1;
                best = max(best, (long long) height * width);
            }
            stack.push_back(i);
        }
        return (int) best;
    }
};
`,
    java: `class Solution {
    public int maxPanelArea(int[] heights) {
        int n = heights.length;
        int[] stack = new int[n + 1];
        int top = -1;
        long best = 0;
        for (int i = 0; i <= n; i++) {
            int h = i < n ? heights[i] : 0;
            while (top >= 0 && heights[stack[top]] >= h) {
                int height = heights[stack[top--]];
                long width = top < 0 ? i : i - stack[top] - 1;
                best = Math.max(best, (long) height * width);
            }
            stack[++top] = i;
        }
        return (int) best;
    }
}
`,
    javascript: `var maxPanelArea = function (heights) {
  const stack = []
  let best = 0
  const n = heights.length
  for (let i = 0; i <= n; i++) {
    const h = i < n ? heights[i] : 0
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()]
      const width = stack.length ? i - stack[stack.length - 1] - 1 : i
      best = Math.max(best, height * width)
    }
    stack.push(i)
  }
  return best
}
`,
  },
}
