import type { CodingProblem } from '../problemTypes'

/**
 * Dynamic programming and greedy. Five problems: one 1-D DP warm-up, a greedy
 * feasibility sweep, an unbounded-knapsack DP, a binary-search-on-DP classic,
 * and a 2-D table to close it out. Reserved id prefix: `cp-dp-`.
 */

const vaultRow: CodingProblem = {
  id: 'cp-dp-vault-row',
  title: 'Vault Row',
  difficulty: 'Easy',
  topics: ['Dynamic programming', 'Array'],
  roles: ['sde'],
  statement: [
    'A vault has prize boxes arranged in a single row. Box `i` holds `boxes[i]` rupees.',
    'Every pair of *adjacent* boxes shares a hidden pressure-plate: opening both trips the alarm. Boxes that are not next to each other share no plate, no matter how much money sits between them.',
    'Return the largest total you can collect by opening a set of boxes with no two adjacent.',
    'Checking every subset is exponential. Think about it one box at a time: for box `i`, either you skip it and keep whatever the best total was up to `i - 1`, or you take it and add it to the best total up to `i - 2`.',
  ],
  constraints: ['1 <= boxes.length <= 100000', '0 <= boxes[i] <= 10000'],
  signature: {
    name: 'maxHaul',
    params: [{ name: 'boxes', type: 'int[]' }],
    returns: 'int',
  },
  cases: [
    { args: [[1, 2, 3, 1]], expected: 4, note: 'Open boxes 0 and 2: 1 + 3 = 4. Opening 1 and 3 only gives 3.' },
    { args: [[2, 7, 9, 3, 1]], expected: 12, note: 'Open boxes 0, 2 and 4: 2 + 9 + 1 = 12.' },
    { args: [[5]], expected: 5, note: 'One box has nothing adjacent to it.' },
    { args: [[0, 0, 0, 0]], expected: 0, hidden: true },
    { args: [[2, 1, 1, 2]], expected: 4, hidden: true },
    { args: [[1, 3, 1]], expected: 3, hidden: true },
    { args: [[4, 1, 1, 4, 1, 1, 4]], expected: 12, hidden: true },
    { args: [[10, 1, 1, 10, 1, 1, 10, 1, 1, 10]], expected: 40, hidden: true },
  ],
  origin: { source: 'LeetCode', title: 'House Robber', url: 'https://leetcode.com/problems/house-robber/' },
  hints: [
    'Track two running numbers as you scan left to right: the best total ending at or before the previous box, and the best total ending at or before the box before that.',
    'At each box the answer is `max(skip it, take it + best-two-back)`. You never need the whole array of partial answers, just the last two.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def maxHaul(self, boxes: List[int]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int maxHaul(vector<int>& boxes) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int maxHaul(int[] boxes) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} boxes
 * @return {number}
 */
var maxHaul = function (boxes) {
  // your code here
  return 0
}
`,
  },
}

const shuttleLoop: CodingProblem = {
  id: 'cp-dp-shuttle-loop',
  title: 'Shuttle Loop',
  difficulty: 'Medium',
  topics: ['Greedy', 'Array'],
  roles: ['sde', 'quant'],
  statement: [
    'A campus shuttle runs a fixed loop of `n` stops, numbered `0` to `n - 1` in the direction of travel; after stop `n - 1` it wraps back around to stop `0`.',
    'At stop `i` the shuttle collects `fuel[i]` litres, and it burns exactly `cost[i]` litres driving from stop `i` to the next stop on the route. The tank starts the loop empty and has no maximum capacity.',
    'Return the stop the shuttle should start from so it completes the *entire* loop without the tank ever going negative. If more than one starting stop works, return the smallest such index. If total fuel collected over the whole loop is less than total fuel burned, no start works at all — return `-1`.',
    'Testing every starting stop against the full loop is `O(n²)`. One pass that tracks a running tank and total is enough: whenever the running tank would go negative, no stop at or before that point could have worked, so the next candidate start is right after it.',
  ],
  constraints: ['1 <= fuel.length == cost.length <= 100000', '0 <= fuel[i], cost[i] <= 10000'],
  signature: {
    name: 'shuttleStart',
    params: [
      { name: 'fuel', type: 'int[]' },
      { name: 'cost', type: 'int[]' },
    ],
    returns: 'int',
  },
  cases: [
    {
      args: [
        [1, 2, 3, 4, 5],
        [3, 4, 5, 1, 2],
      ],
      expected: 3,
      note: 'Starting at stop 3: tank goes 4→3→5→3→4→0, never negative, and finishes back at stop 3.',
    },
    {
      args: [
        [2, 3, 4],
        [3, 4, 3],
      ],
      expected: -1,
      note: 'Total fuel is 9, total cost is 10 — no starting stop can ever make up that gap.',
    },
    {
      args: [
        [5, 1, 2, 3, 4],
        [4, 4, 1, 5, 1],
      ],
      expected: 4,
      note: 'Stop 4 is the only one from which the tank never dips below zero.',
    },
    { args: [[5], [4]], expected: 0, hidden: true },
    { args: [[5], [6]], expected: -1, hidden: true },
    {
      args: [
        [3, 3, 3],
        [3, 3, 3],
      ],
      expected: 0,
      hidden: true,
    },
    {
      args: [
        [4, 5, 2, 6, 5, 3],
        [3, 2, 7, 3, 2, 9],
      ],
      expected: -1,
      hidden: true,
    },
    {
      args: [
        [1, 2, 3, 4, 5, 6],
        [2, 2, 2, 2, 2, 2],
      ],
      expected: 1,
      hidden: true,
    },
  ],
  origin: { source: 'LeetCode', title: 'Gas Station', url: 'https://leetcode.com/problems/gas-station/' },
  hints: [
    'If the tank goes negative at stop `j` while starting from stop `s`, no stop between `s` and `j` (inclusive) can be a valid start either — starting later only means arriving at `j` with less fuel banked, never more.',
    'Sweep once, keep a running tank and a running total. Reset the candidate start (and the tank, but not the total) every time the tank dips below zero. If the total ever ends up negative, print -1; otherwise the last candidate start is the answer.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def shuttleStart(self, fuel: List[int], cost: List[int]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int shuttleStart(vector<int>& fuel, vector<int>& cost) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int shuttleStart(int[] fuel, int[] cost) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} fuel
 * @param {number[]} cost
 * @return {number}
 */
var shuttleStart = function (fuel, cost) {
  // your code here
  return 0
}
`,
  },
}

const canteenChange: CodingProblem = {
  id: 'cp-dp-canteen-change',
  title: 'Canteen Change',
  difficulty: 'Medium',
  topics: ['Dynamic programming'],
  roles: ['sde', 'quant'],
  statement: [
    "The canteen till holds an unlimited supply of coins in the denominations listed in `coins`, and a customer is owed exactly `amount` rupees in change.",
    'Return the fewest coins that sum to exactly `amount`. If no combination of the given denominations reaches that exact amount, return `-1`.',
    'Always handing out the largest coin that still fits is the obvious approach, and it is wrong for some denominations — it can spend more coins than necessary, or miss the exact amount entirely. The reliable approach builds up the answer for every smaller amount first.',
  ],
  constraints: [
    '1 <= coins.length <= 50',
    '1 <= coins[i] <= 10000',
    'All values in coins are distinct',
    '0 <= amount <= 10000',
  ],
  signature: {
    name: 'minCoins',
    params: [
      { name: 'coins', type: 'int[]' },
      { name: 'amount', type: 'int' },
    ],
    returns: 'int',
  },
  cases: [
    { args: [[1, 2, 5], 11], expected: 3, note: 'Two 5s and a 1: 5 + 5 + 1 = 11, three coins.' },
    {
      args: [[1, 3, 4], 6],
      expected: 2,
      note: 'Two 3s beat always grabbing the biggest coin first (4 + 1 + 1 would take three).',
    },
    { args: [[2], 3], expected: -1, note: 'Every combination of 2s is even; 3 is never reachable.' },
    { args: [[1, 2, 5], 0], expected: 0, hidden: true },
    { args: [[186, 419, 83, 408], 6249], expected: 20, hidden: true },
    { args: [[3, 7], 5], expected: -1, hidden: true },
    { args: [[5], 100], expected: 20, hidden: true },
    { args: [[7, 2, 3], 14], expected: 2, hidden: true },
  ],
  origin: { source: 'LeetCode', title: 'Coin Change', url: 'https://leetcode.com/problems/coin-change/' },
  hints: [
    'Build an array `best[0..amount]` where `best[a]` is the fewest coins that make exactly `a`, with `best[0] = 0`.',
    'For every amount `a` from 1 up to the target, try every coin `c <= a` and take `best[a - c] + 1` if it beats what you already have for `best[a]`. Leave `best[a]` as "unreachable" if nothing ever beats it.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def minCoins(self, coins: List[int], amount: int) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int minCoins(vector<int>& coins, int amount) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int minCoins(int[] coins, int amount) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
var minCoins = function (coins, amount) {
  // your code here
  return 0
}
`,
  },
}

const momentumStreak: CodingProblem = {
  id: 'cp-dp-momentum-streak',
  title: 'Longest Momentum Streak',
  difficulty: 'Medium',
  topics: ['Dynamic programming', 'Binary search'],
  roles: ['sde', 'quant'],
  statement: [
    'A founder logs one integer metric per week — signups, say — in `scores`, oldest first.',
    'A momentum streak is any sequence of weeks, not necessarily consecutive on the calendar but kept in their original order, whose scores strictly increase from each chosen week to the next.',
    'Return the length of the longest momentum streak in `scores`.',
    'Comparing every pair of weeks is `O(n²)` and will not finish on the largest input. There is an `O(n log n)` method: keep, for every streak length seen so far, the smallest possible score a streak of that length could end on, and use binary search to update it as you scan.',
  ],
  constraints: ['1 <= scores.length <= 100000', '-1000000000 <= scores[i] <= 1000000000'],
  signature: {
    name: 'longestStreak',
    params: [{ name: 'scores', type: 'int[]' }],
    returns: 'int',
  },
  cases: [
    {
      args: [[10, 9, 2, 5, 3, 7, 101, 18]],
      expected: 4,
      note: '2, 3, 7, 18 (weeks 2, 4, 5, 7) is a streak of length 4.',
    },
    { args: [[0, 1, 0, 3, 2, 3]], expected: 4, note: '0, 1, 2, 3 (weeks 0, 1, 4, 5) is a streak of length 4.' },
    { args: [[7, 7, 7, 7]], expected: 1, note: 'Equal scores never extend a streak, so no pick beats a single week.' },
    { args: [[1]], expected: 1, hidden: true },
    { args: [[5, 4, 3, 2, 1]], expected: 1, hidden: true },
    { args: [[1, 2, 3, 4, 5]], expected: 5, hidden: true },
    { args: [[2, 2, 2, 3, 3, 3, 4]], expected: 3, hidden: true },
    { args: [[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9]], expected: 6, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Longest Increasing Subsequence',
    url: 'https://leetcode.com/problems/longest-increasing-subsequence/',
  },
  hints: [
    'Keep an array `tails` where `tails[k]` is the smallest ending score among all streaks of length `k + 1` found so far. `tails` is always sorted, which is what makes binary search valid on it.',
    'For each new score, binary-search `tails` for the first entry that is not smaller than it. Overwrite that entry (or append, if the score is bigger than everything in `tails`). The final length of `tails` is the answer — it does not have to hold an actual streak, only the right length.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def longestStreak(self, scores: List[int]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int longestStreak(vector<int>& scores) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int longestStreak(int[] scores) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} scores
 * @return {number}
 */
var longestStreak = function (scores) {
  // your code here
  return 0
}
`,
  },
}

const rollNumberCorrection: CodingProblem = {
  id: 'cp-dp-roll-correction',
  title: 'Roll Number Correction',
  difficulty: 'Hard',
  topics: ['Dynamic programming', 'String'],
  roles: ['sde'],
  statement: [
    'A scanner misread a roll number: it produced the string `typed` when the real value is `correct`.',
    'Fixing it takes single-character edits of three kinds — insert one character, delete one character, or substitute one character for a different one — and each edit counts as one step, regardless of kind.',
    'Return the minimum number of edits needed to turn `typed` into `correct`.',
    'Comparing the strings position by position only works if they are the same length and never drift apart. In general they do not: the right approach builds the answer for every prefix of `typed` against every prefix of `correct`, using the answers for shorter prefixes to get the longer ones.',
  ],
  constraints: [
    '0 <= typed.length, correct.length <= 1000',
    'typed and correct consist of lowercase English letters and digits only',
  ],
  signature: {
    name: 'minEdits',
    params: [
      { name: 'typed', type: 'string' },
      { name: 'correct', type: 'string' },
    ],
    returns: 'int',
  },
  cases: [
    {
      args: ['ce21b032', 'ce21b023'],
      expected: 2,
      note: 'The last two digits are swapped: substitute the 3 for a 2 and the 2 for a 3.',
    },
    {
      args: ['kitten', 'sitting'],
      expected: 3,
      note: 'Substitute k→s, substitute e→i, insert a g at the end.',
    },
    { args: ['', 'xyz'], expected: 3, note: 'Every character of an empty string must be inserted.' },
    { args: ['abc', ''], expected: 3, hidden: true },
    { args: ['', ''], expected: 0, hidden: true },
    { args: ['abcdef', 'abcdef'], expected: 0, hidden: true },
    { args: ['intention', 'execution'], expected: 5, hidden: true },
    { args: ['cs21b001', 'cs21b100'], expected: 2, hidden: true },
  ],
  origin: { source: 'LeetCode', title: 'Edit Distance', url: 'https://leetcode.com/problems/edit-distance/' },
  hints: [
    'Let `dp[i][j]` be the answer for the first `i` characters of `typed` and the first `j` characters of `correct`. The base cases are `dp[i][0] = i` and `dp[0][j] = j` — pure insertions or pure deletions.',
    'If the two characters at the ends of the current prefixes match, `dp[i][j] = dp[i-1][j-1]` — that pair is free. If they do not, it costs one edit plus the best of the three neighbours: delete from `typed` (`dp[i-1][j]`), insert into `typed` (`dp[i][j-1]`), or substitute (`dp[i-1][j-1]`).',
  ],
  starter: {
    python: `class Solution:
    def minEdits(self, typed: str, correct: str) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int minEdits(string typed, string correct) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int minEdits(String typed, String correct) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {string} typed
 * @param {string} correct
 * @return {number}
 */
var minEdits = function (typed, correct) {
  // your code here
  return 0
}
`,
  },
}

export const DP_PROBLEMS: CodingProblem[] = [
  vaultRow,
  shuttleLoop,
  canteenChange,
  momentumStreak,
  rollNumberCorrection,
]
