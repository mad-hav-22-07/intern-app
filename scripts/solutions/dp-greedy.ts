import type { SolutionSet } from './index'

/** Reference solutions for `src/data/problems/dp-greedy.ts`. */
export const DP_SOLUTIONS: Record<string, SolutionSet> = {
  'cp-dp-vault-row': {
    python: `from typing import List

class Solution:
    def maxHaul(self, boxes: List[int]) -> int:
        prev, cur = 0, 0
        for x in boxes:
            prev, cur = cur, max(cur, prev + x)
        return cur
`,
    cpp: `class Solution {
public:
    int maxHaul(vector<int>& boxes) {
        int prev = 0, cur = 0;
        for (int x : boxes) {
            int nxt = max(cur, prev + x);
            prev = cur;
            cur = nxt;
        }
        return cur;
    }
};
`,
    java: `class Solution {
    public int maxHaul(int[] boxes) {
        int prev = 0, cur = 0;
        for (int x : boxes) {
            int nxt = Math.max(cur, prev + x);
            prev = cur;
            cur = nxt;
        }
        return cur;
    }
}
`,
    javascript: `var maxHaul = function (boxes) {
  let prev = 0, cur = 0
  for (const x of boxes) {
    const nxt = Math.max(cur, prev + x)
    prev = cur
    cur = nxt
  }
  return cur
}
`,
  },
  'cp-dp-shuttle-loop': {
    python: `from typing import List

class Solution:
    def shuttleStart(self, fuel: List[int], cost: List[int]) -> int:
        total = 0
        tank = 0
        start = 0
        for i in range(len(fuel)):
            diff = fuel[i] - cost[i]
            total += diff
            tank += diff
            if tank < 0:
                start = i + 1
                tank = 0
        return start if total >= 0 else -1
`,
    cpp: `class Solution {
public:
    int shuttleStart(vector<int>& fuel, vector<int>& cost) {
        long long total = 0, tank = 0;
        int start = 0;
        for (int i = 0; i < (int)fuel.size(); i++) {
            long long diff = (long long)fuel[i] - cost[i];
            total += diff;
            tank += diff;
            if (tank < 0) {
                start = i + 1;
                tank = 0;
            }
        }
        return total >= 0 ? start : -1;
    }
};
`,
    java: `class Solution {
    public int shuttleStart(int[] fuel, int[] cost) {
        long total = 0, tank = 0;
        int start = 0;
        for (int i = 0; i < fuel.length; i++) {
            long diff = (long) fuel[i] - cost[i];
            total += diff;
            tank += diff;
            if (tank < 0) {
                start = i + 1;
                tank = 0;
            }
        }
        return total >= 0 ? start : -1;
    }
}
`,
    javascript: `var shuttleStart = function (fuel, cost) {
  let total = 0, tank = 0, start = 0
  for (let i = 0; i < fuel.length; i++) {
    const diff = fuel[i] - cost[i]
    total += diff
    tank += diff
    if (tank < 0) {
      start = i + 1
      tank = 0
    }
  }
  return total >= 0 ? start : -1
}
`,
  },
  'cp-dp-canteen-change': {
    python: `from typing import List

class Solution:
    def minCoins(self, coins: List[int], amount: int) -> int:
        INF = float('inf')
        best = [0] + [INF] * amount
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a and best[a - c] + 1 < best[a]:
                    best[a] = best[a - c] + 1
        return -1 if best[amount] == INF else best[amount]
`,
    cpp: `class Solution {
public:
    int minCoins(vector<int>& coins, int amount) {
        const int INF = INT_MAX / 2;
        vector<int> best(amount + 1, INF);
        best[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a && best[a - c] + 1 < best[a]) best[a] = best[a - c] + 1;
            }
        }
        return best[amount] >= INF ? -1 : best[amount];
    }
};
`,
    java: `class Solution {
    public int minCoins(int[] coins, int amount) {
        final int INF = Integer.MAX_VALUE / 2;
        int[] best = new int[amount + 1];
        java.util.Arrays.fill(best, INF);
        best[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a && best[a - c] + 1 < best[a]) best[a] = best[a - c] + 1;
            }
        }
        return best[amount] >= INF ? -1 : best[amount];
    }
}
`,
    javascript: `var minCoins = function (coins, amount) {
  const INF = Infinity
  const best = new Array(amount + 1).fill(INF)
  best[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && best[a - c] + 1 < best[a]) best[a] = best[a - c] + 1
    }
  }
  return best[amount] === INF ? -1 : best[amount]
}
`,
  },
  'cp-dp-momentum-streak': {
    python: `from typing import List
import bisect

class Solution:
    def longestStreak(self, scores: List[int]) -> int:
        tails: List[int] = []
        for x in scores:
            i = bisect.bisect_left(tails, x)
            if i == len(tails):
                tails.append(x)
            else:
                tails[i] = x
        return len(tails)
`,
    cpp: `class Solution {
public:
    int longestStreak(vector<int>& scores) {
        vector<int> tails;
        for (int x : scores) {
            auto it = lower_bound(tails.begin(), tails.end(), x);
            if (it == tails.end()) tails.push_back(x);
            else *it = x;
        }
        return (int)tails.size();
    }
};
`,
    java: `class Solution {
    public int longestStreak(int[] scores) {
        int[] tails = new int[scores.length];
        int len = 0;
        for (int x : scores) {
            int lo = 0, hi = len;
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (tails[mid] < x) lo = mid + 1;
                else hi = mid;
            }
            tails[lo] = x;
            if (lo == len) len++;
        }
        return len;
    }
}
`,
    javascript: `var longestStreak = function (scores) {
  const tails = []
  for (const x of scores) {
    let lo = 0, hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < x) lo = mid + 1
      else hi = mid
    }
    tails[lo] = x
  }
  return tails.length
}
`,
  },
  'cp-dp-roll-correction': {
    python: `class Solution:
    def minEdits(self, typed: str, correct: str) -> int:
        n, m = len(typed), len(correct)
        dp = list(range(m + 1))
        for i in range(1, n + 1):
            prev_diag = dp[0]
            dp[0] = i
            for j in range(1, m + 1):
                tmp = dp[j]
                if typed[i - 1] == correct[j - 1]:
                    dp[j] = prev_diag
                else:
                    dp[j] = 1 + min(prev_diag, dp[j], dp[j - 1])
                prev_diag = tmp
        return dp[m]
`,
    cpp: `class Solution {
public:
    int minEdits(string typed, string correct) {
        int n = (int)typed.size(), m = (int)correct.size();
        vector<int> dp(m + 1);
        for (int j = 0; j <= m; j++) dp[j] = j;
        for (int i = 1; i <= n; i++) {
            int prevDiag = dp[0];
            dp[0] = i;
            for (int j = 1; j <= m; j++) {
                int tmp = dp[j];
                if (typed[i - 1] == correct[j - 1]) dp[j] = prevDiag;
                else dp[j] = 1 + min({prevDiag, dp[j], dp[j - 1]});
                prevDiag = tmp;
            }
        }
        return dp[m];
    }
};
`,
    java: `class Solution {
    public int minEdits(String typed, String correct) {
        int n = typed.length(), m = correct.length();
        int[] dp = new int[m + 1];
        for (int j = 0; j <= m; j++) dp[j] = j;
        for (int i = 1; i <= n; i++) {
            int prevDiag = dp[0];
            dp[0] = i;
            for (int j = 1; j <= m; j++) {
                int tmp = dp[j];
                if (typed.charAt(i - 1) == correct.charAt(j - 1)) dp[j] = prevDiag;
                else dp[j] = 1 + Math.min(prevDiag, Math.min(dp[j], dp[j - 1]));
                prevDiag = tmp;
            }
        }
        return dp[m];
    }
}
`,
    javascript: `var minEdits = function (typed, correct) {
  const n = typed.length, m = correct.length
  const dp = new Array(m + 1)
  for (let j = 0; j <= m; j++) dp[j] = j
  for (let i = 1; i <= n; i++) {
    let prevDiag = dp[0]
    dp[0] = i
    for (let j = 1; j <= m; j++) {
      const tmp = dp[j]
      if (typed[i - 1] === correct[j - 1]) dp[j] = prevDiag
      else dp[j] = 1 + Math.min(prevDiag, dp[j], dp[j - 1])
      prevDiag = tmp
    }
  }
  return dp[m]
}
`,
  },
}
