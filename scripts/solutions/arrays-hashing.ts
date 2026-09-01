import type { SolutionSet } from './index'

/** Reference solutions for `src/data/problems/arrays-hashing.ts`. */
export const ARRAYS_SOLUTIONS: Record<string, SolutionSet> = {
  'cp-ar-class-president': {
    python: `from typing import List

class Solution:
    def president(self, votes: List[int]) -> int:
        candidate = 0
        count = 0
        for v in votes:
            if count == 0:
                candidate = v
            count += 1 if v == candidate else -1
        return candidate
`,
    cpp: `class Solution {
public:
    int president(vector<int>& votes) {
        long long candidate = 0;
        int count = 0;
        for (int v : votes) {
            if (count == 0) candidate = v;
            count += (v == candidate) ? 1 : -1;
        }
        return (int) candidate;
    }
};
`,
    java: `class Solution {
    public int president(int[] votes) {
        long candidate = 0;
        int count = 0;
        for (int v : votes) {
            if (count == 0) candidate = v;
            count += (v == candidate) ? 1 : -1;
        }
        return (int) candidate;
    }
}
`,
    javascript: `var president = function (votes) {
  let candidate = 0
  let count = 0
  for (const v of votes) {
    if (count === 0) candidate = v
    count += v === candidate ? 1 : -1
  }
  return candidate
}
`,
  },
  'cp-ar-word-families': {
    python: `from typing import List

class Solution:
    def wordFamilies(self, words: List[str]) -> List[List[int]]:
        groups = {}
        order = []
        for i, w in enumerate(words):
            key = ''.join(sorted(w))
            if key not in groups:
                groups[key] = []
                order.append(key)
            groups[key].append(i)
        result = [groups[k] for k in order]
        result.sort(key=lambda g: g[0])
        return result
`,
    cpp: `class Solution {
public:
    vector<vector<int>> wordFamilies(vector<string>& words) {
        unordered_map<string, vector<int>> groups;
        for (int i = 0; i < (int)words.size(); i++) {
            string key = words[i];
            sort(key.begin(), key.end());
            groups[key].push_back(i);
        }
        vector<vector<int>> result;
        for (auto& [key, idxs] : groups) result.push_back(idxs);
        sort(result.begin(), result.end(), [](const vector<int>& a, const vector<int>& b) {
            return a[0] < b[0];
        });
        return result;
    }
};
`,
    java: `class Solution {
    public int[][] wordFamilies(String[] words) {
        java.util.Map<String, java.util.List<Integer>> groups = new java.util.HashMap<>();
        for (int i = 0; i < words.length; i++) {
            char[] chars = words[i].toCharArray();
            java.util.Arrays.sort(chars);
            String key = new String(chars);
            groups.computeIfAbsent(key, k -> new java.util.ArrayList<>()).add(i);
        }
        java.util.List<java.util.List<Integer>> result = new java.util.ArrayList<>(groups.values());
        result.sort((a, b) -> a.get(0) - b.get(0));
        int[][] out = new int[result.size()][];
        for (int i = 0; i < result.size(); i++) {
            java.util.List<Integer> g = result.get(i);
            int[] row = new int[g.size()];
            for (int j = 0; j < g.size(); j++) row[j] = g.get(j);
            out[i] = row;
        }
        return out;
    }
}
`,
    javascript: `var wordFamilies = function (words) {
  const groups = new Map()
  for (let i = 0; i < words.length; i++) {
    const key = words[i].split('').sort().join('')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(i)
  }
  const result = Array.from(groups.values())
  result.sort((a, b) => a[0] - b[0])
  return result
}
`,
  },
  'cp-ar-scoreboard-echo': {
    python: `from typing import List

class Solution:
    def echo(self, scores: List[int]) -> List[int]:
        n = len(scores)
        result = [1] * n
        left = 1
        for i in range(n):
            result[i] = left
            left *= scores[i]
        right = 1
        for i in range(n - 1, -1, -1):
            result[i] *= right
            right *= scores[i]
        return result
`,
    cpp: `class Solution {
public:
    vector<int> echo(vector<int>& scores) {
        int n = (int) scores.size();
        vector<long long> result(n, 1);
        long long left = 1;
        for (int i = 0; i < n; i++) {
            result[i] = left;
            left *= scores[i];
        }
        long long right = 1;
        for (int i = n - 1; i >= 0; i--) {
            result[i] *= right;
            right *= scores[i];
        }
        return vector<int>(result.begin(), result.end());
    }
};
`,
    java: `class Solution {
    public int[] echo(int[] scores) {
        int n = scores.length;
        long[] result = new long[n];
        long left = 1;
        for (int i = 0; i < n; i++) {
            result[i] = left;
            left *= scores[i];
        }
        long right = 1;
        for (int i = n - 1; i >= 0; i--) {
            result[i] *= right;
            right *= scores[i];
        }
        int[] out = new int[n];
        for (int i = 0; i < n; i++) out[i] = (int) result[i];
        return out;
    }
}
`,
    javascript: `var echo = function (scores) {
  const n = scores.length
  const result = new Array(n).fill(1)
  let left = 1
  for (let i = 0; i < n; i++) {
    result[i] = left
    left *= scores[i]
  }
  let right = 1
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= right
    right *= scores[i]
  }
  return result
}
`,
  },
  'cp-ar-badge-chain': {
    python: `from typing import List

class Solution:
    def longestChain(self, badges: List[int]) -> int:
        s = set(badges)
        best = 0
        for n in s:
            if n - 1 not in s:
                length = 1
                cur = n
                while cur + 1 in s:
                    cur += 1
                    length += 1
                best = max(best, length)
        return best
`,
    cpp: `class Solution {
public:
    int longestChain(vector<int>& badges) {
        unordered_set<int> s(badges.begin(), badges.end());
        int best = 0;
        for (int n : s) {
            if (!s.count(n - 1)) {
                int length = 1;
                int cur = n;
                while (s.count(cur + 1)) {
                    cur++;
                    length++;
                }
                best = max(best, length);
            }
        }
        return best;
    }
};
`,
    java: `class Solution {
    public int longestChain(int[] badges) {
        java.util.Set<Integer> s = new java.util.HashSet<>();
        for (int b : badges) s.add(b);
        int best = 0;
        for (int n : s) {
            if (!s.contains(n - 1)) {
                int length = 1;
                int cur = n;
                while (s.contains(cur + 1)) {
                    cur++;
                    length++;
                }
                best = Math.max(best, length);
            }
        }
        return best;
    }
}
`,
    javascript: `var longestChain = function (badges) {
  const s = new Set(badges)
  let best = 0
  for (const n of s) {
    if (!s.has(n - 1)) {
      let length = 1
      let cur = n
      while (s.has(cur + 1)) {
        cur++
        length++
      }
      best = Math.max(best, length)
    }
  }
  return best
}
`,
  },
  'cp-ar-donation-batches': {
    python: `from typing import List

class Solution:
    def countBatches(self, donations: List[int], goal: int) -> int:
        counts = {0: 1}
        running = 0
        total = 0
        for d in donations:
            running += d
            total += counts.get(running - goal, 0)
            counts[running] = counts.get(running, 0) + 1
        return total
`,
    cpp: `class Solution {
public:
    int countBatches(vector<int>& donations, int goal) {
        unordered_map<long long, int> counts;
        counts[0] = 1;
        long long running = 0;
        long long total = 0;
        for (int d : donations) {
            running += d;
            auto it = counts.find(running - goal);
            if (it != counts.end()) total += it->second;
            counts[running]++;
        }
        return (int) total;
    }
};
`,
    java: `class Solution {
    public int countBatches(int[] donations, int goal) {
        java.util.Map<Long, Integer> counts = new java.util.HashMap<>();
        counts.put(0L, 1);
        long running = 0;
        long total = 0;
        for (int d : donations) {
            running += d;
            total += counts.getOrDefault(running - goal, 0);
            counts.merge(running, 1, Integer::sum);
        }
        return (int) total;
    }
}
`,
    javascript: `var countBatches = function (donations, goal) {
  const counts = new Map([[0, 1]])
  let running = 0
  let total = 0
  for (const d of donations) {
    running += d
    total += counts.get(running - goal) || 0
    counts.set(running, (counts.get(running) || 0) + 1)
  }
  return total
}
`,
  },
}
