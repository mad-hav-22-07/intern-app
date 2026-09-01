import type { CodingProblem } from '../problemTypes'

/**
 * Two pointers, sliding windows and string scanning. Reserved id prefix: `cp-tp-`.
 */

const mirrorMessage: CodingProblem = {
  id: 'cp-tp-mirror-message',
  title: 'Mirror Message',
  difficulty: 'Easy',
  topics: ['Two pointers', 'String'],
  roles: ['sde'],
  statement: [
    "A message is *clean* if you ignore every character that isn't a letter or a digit, and ignore case.",
    'Given a string `s`, return `true` if the clean version of `s` reads the same forwards and backwards, and `false` otherwise. A message with no letters or digits at all is considered to read the same both ways.',
    "You could build the cleaned string and reverse it, but you don't have to: two pointers walking inward from each end, skipping anything that isn't alphanumeric, settle it in a single pass with no extra string.",
  ],
  constraints: ['1 <= s.length <= 200000', 's consists of printable ASCII characters'],
  signature: {
    name: 'readsSame',
    params: [{ name: 's', type: 'string' }],
    returns: 'boolean',
  },
  cases: [
    {
      args: ['A man, a plan, a canal: Panama'],
      expected: true,
      note: 'Punctuation, spaces and case are all ignored.',
    },
    { args: ['race a car'], expected: false, note: '"raceacar" is not the same reversed.' },
    { args: [' '], expected: true, note: 'No letters or digits at all — vacuously a match.' },
    { args: ['0P'], expected: false, hidden: true },
    { args: ['ab_a'], expected: true, hidden: true },
    { args: ['.'], expected: true, hidden: true },
    { args: ['12321'], expected: true, hidden: true },
    { args: ['1a2'], expected: false, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Valid Palindrome',
    url: 'https://leetcode.com/problems/valid-palindrome/',
  },
  hints: [
    'Keep one index at the front and one at the back. Before comparing, advance each past any character that is not a letter or digit.',
    "Lowercase both characters (or uppercase both) before comparing them — that's the only place case matters.",
  ],
  starter: {
    python: `class Solution:
    def readsSame(self, s: str) -> bool:
        # your code here
        return False
`,
    cpp: `class Solution {
public:
    bool readsSame(string s) {
        // your code here
        return false;
    }
};
`,
    java: `class Solution {
    public boolean readsSame(String s) {
        // your code here
        return false;
    }
}
`,
    javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var readsSame = function (s) {
  // your code here
  return false
}
`,
  },
}

const canalDam: CodingProblem = {
  id: 'cp-tp-canal-dam',
  title: 'Canal Dam',
  difficulty: 'Medium',
  topics: ['Two pointers', 'Array', 'Greedy'],
  roles: ['sde', 'quant'],
  statement: [
    'A canal bank has a row of vertical pillars; pillar `i` stands `heights[i]` metres tall, and consecutive pillars are one metre apart.',
    'Choose two pillars and stretch a dam between them. Water spills over the shorter of the two, so the dam holds `min(heights[i], heights[j]) * |i - j|` litres. Given `heights`, return the most litres any single pair of pillars can hold.',
    'Trying every pair is `O(n²)` and will not finish on the largest inputs. Start with the widest possible pair — the two ends — and each step move in from whichever side is shorter; that pillar could never have done better paired with anything farther away.',
  ],
  constraints: ['2 <= heights.length <= 100000', '0 <= heights[i] <= 10000'],
  signature: {
    name: 'maxCanalVolume',
    params: [{ name: 'heights', type: 'int[]' }],
    returns: 'int',
  },
  cases: [
    {
      args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]],
      expected: 49,
      note: 'Pillars at index 1 (height 8) and index 8 (height 7) hold min(8,7) × 7 = 49.',
    },
    { args: [[1, 1]], expected: 1, note: 'Only one pair is possible.' },
    {
      args: [[4, 3, 2, 1, 4]],
      expected: 16,
      note: 'The two tallest pillars happen to be the two ends: min(4,4) × 4 = 16.',
    },
    { args: [[1, 2, 1]], expected: 2, hidden: true },
    { args: [[1, 2, 4, 3]], expected: 4, hidden: true },
    { args: [[0, 0, 0]], expected: 0, hidden: true },
    { args: [[2, 3, 10, 5, 7, 8, 9]], expected: 36, hidden: true },
    { args: [Array(100000).fill(5)], expected: 499995, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Container With Most Water',
    url: 'https://leetcode.com/problems/container-with-most-water/',
  },
  hints: [
    'The distance between two pillars only shrinks as the pointers move inward, so moving in from the *taller* side can never increase the answer.',
    'Move the pointer at the shorter pillar inward. Whatever it was paired with, no pillar farther away can beat what you already have while that side stays the bottleneck.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def maxCanalVolume(self, heights: List[int]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int maxCanalVolume(vector<int>& heights) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int maxCanalVolume(int[] heights) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} heights
 * @return {number}
 */
var maxCanalVolume = function (heights) {
  // your code here
  return 0
}
`,
  },
}

const balancedTriples: CodingProblem = {
  id: 'cp-tp-balanced-triples',
  title: 'Balanced Triples',
  difficulty: 'Medium',
  topics: ['Two pointers', 'Array', 'Sorting'],
  roles: ['sde', 'quant'],
  statement: [
    'A ledger lists `nums`, a set of signed transaction amounts. A *balanced triple* is a set of three transactions (three different entries in the ledger, but identified by their amounts, not their positions) whose amounts add up to exactly zero.',
    'Given `nums`, return the number of distinct balanced triples. Two triples are the same if they use the same three amounts in any order — three separate zero entries in the ledger still form only one balanced triple, `(0, 0, 0)`.',
    'The nested loop plus a hash lookup you would use for a pair is `O(n²)` per candidate here, so `O(n³)` overall — too slow at the upper end. Sort first: fixing each amount as the anchor and sweeping the rest with two pointers finds every partner pair for that anchor in `O(n)`, and skipping past repeats keeps the same trio from being counted twice.',
  ],
  constraints: ['3 <= nums.length <= 3000', '-100000 <= nums[i] <= 100000'],
  signature: {
    name: 'countZeroTriples',
    params: [{ name: 'nums', type: 'int[]' }],
    returns: 'int',
  },
  cases: [
    {
      args: [[-1, 0, 1, 2, -1, -4]],
      expected: 2,
      note: '(-1, -1, 2) and (-1, 0, 1) are the only two distinct balanced triples.',
    },
    { args: [[0, 1, 1]], expected: 0, note: 'No three of these sum to zero.' },
    {
      args: [[0, 0, 0]],
      expected: 1,
      note: 'There are three zeros to choose from, but only one distinct triple: (0, 0, 0).',
    },
    { args: [[1, 2, 3]], expected: 0, hidden: true },
    { args: [[0, 0, 0, 0]], expected: 1, hidden: true },
    { args: [[-2, 0, 0, 2, 2]], expected: 1, hidden: true },
    { args: [[3, -2, 1, 0, -1, -2, 1, 4, -3]], expected: 6, hidden: true },
    { args: [[-4, -2, -2, -2, 0, 1, 2, 2, 2, 3, 3, 4, 4, 6, 6]], expected: 6, hidden: true },
  ],
  origin: { source: 'LeetCode', title: '3Sum', url: 'https://leetcode.com/problems/3sum/' },
  hints: [
    'Sort the array first. Fix the smallest element of a triple and look for the other two by moving inward from both ends of what remains — exactly like Pair Sum on a sorted array.',
    'After you record a match, skip over any following elements equal to the ones you just used — that is what stops (0, 0, 0) with three zeros in the ledger from being counted three times.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def countZeroTriples(self, nums: List[int]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int countZeroTriples(vector<int>& nums) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int countZeroTriples(int[] nums) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var countZeroTriples = function (nums) {
  // your code here
  return 0
}
`,
  },
}

const budgetRepaint: CodingProblem = {
  id: 'cp-tp-budget-repaint',
  title: 'Budget Repaint',
  difficulty: 'Medium',
  topics: ['Sliding window', 'String'],
  roles: ['sde'],
  statement: [
    'A row of `s.length` tiles is painted in colours given by the string `s`, one uppercase letter per tile. You have a budget: you may repaint up to `k` tiles, each to any colour you like.',
    'Given `s` and `k`, return the length of the longest run of consecutive tiles you can make a single colour after spending at most `k` repaints.',
    'Recomputing the best colour for every window from scratch is `O(n²)`. A window that only ever grows — and only tracks the highest single-colour count it has ever contained — is enough: it never needs to recompute that count downward when the window slides.',
  ],
  constraints: ['1 <= s.length <= 100000', '0 <= k <= s.length', 's consists of uppercase English letters'],
  signature: {
    name: 'longestUniform',
    params: [
      { name: 's', type: 'string' },
      { name: 'k', type: 'int' },
    ],
    returns: 'int',
  },
  cases: [
    {
      args: ['ABAB', 2],
      expected: 4,
      note: 'Repaint both B tiles (or both A tiles) to get four matching tiles in a row.',
    },
    {
      args: ['AABABBA', 1],
      expected: 4,
      note: 'One repaint turns some four consecutive tiles into a single colour.',
    },
    { args: ['ABCDE', 0], expected: 1, note: 'With no repaints, no colour already repeats.' },
    { args: ['A', 0], expected: 1, hidden: true },
    { args: ['AAAA', 0], expected: 4, hidden: true },
    { args: ['AAAB', 10], expected: 4, hidden: true },
    { args: ['BAAAB', 2], expected: 5, hidden: true },
    { args: ['AB'.repeat(50000), 50000], expected: 100000, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Longest Repeating Character Replacement',
    url: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
  },
  hints: [
    'A window of length `L` needs at most `k` repaints exactly when `L - (count of its most common colour) <= k`.',
    'Track the best single-colour count seen in any window so far, even after the window slides past it. It is fine if it goes stale — the window only ever grows, so a stale high count can only push the window forward, never shrink the answer.',
  ],
  starter: {
    python: `class Solution:
    def longestUniform(self, s: str, k: int) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int longestUniform(string s, int k) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int longestUniform(String s, int k) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {string} s
 * @param {number} k
 * @return {number}
 */
var longestUniform = function (s, k) {
  // your code here
  return 0
}
`,
  },
}

const rainBasin: CodingProblem = {
  id: 'cp-tp-rain-basin',
  title: 'Rain Basin',
  difficulty: 'Hard',
  topics: ['Two pointers', 'Array'],
  roles: ['sde'],
  statement: [
    'After a storm, `heights` gives the elevation of a row of unit-width ground segments. Water pools wherever a low stretch is flanked by higher ground on both sides, up to the height of the shorter flank.',
    'Given `heights`, return the total volume of water trapped across the whole row once the rain has settled.',
    'Computing the trapped depth at each position needs the tallest ground to its left and to its right; precomputing both arrays works but costs `O(n)` extra space. Two pointers closing in from either end need only the running max seen so far on each side, giving the same answer in `O(1)` extra space.',
  ],
  constraints: ['1 <= heights.length <= 200000', '0 <= heights[i] <= 1000'],
  signature: {
    name: 'trapWater',
    params: [{ name: 'heights', type: 'int[]' }],
    returns: 'int',
  },
  cases: [
    {
      args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]],
      expected: 6,
      note: 'Six units pool in the two dips between the taller stretches.',
    },
    { args: [[4, 2, 0, 3, 2, 5]], expected: 9, note: 'The tall wall on the right traps water over most of the row.' },
    { args: [[1, 1, 1]], expected: 0, note: 'Flat ground holds nothing.' },
    { args: [[5]], expected: 0, hidden: true },
    { args: [[3, 0, 3]], expected: 3, hidden: true },
    { args: [[5, 4, 1, 2]], expected: 1, hidden: true },
    { args: [[2, 0, 2, 0, 2]], expected: 4, hidden: true },
    {
      args: [Array.from({ length: 200000 }, (_, i) => (i % 2 === 0 ? 1000 : 0))],
      expected: 99999000,
      hidden: true,
    },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Trapping Rain Water',
    url: 'https://leetcode.com/problems/trapping-rain-water/',
  },
  hints: [
    'The water sitting above position `i` is `min(leftMax, rightMax) - heights[i]`, floored at zero. You do not need the exact leftMax and rightMax — only which one is smaller.',
    'Move the pointer on whichever side currently has the smaller running max. The other side can only turn out taller, never shorter, so it can never lower the water level you already committed to on this side.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def trapWater(self, heights: List[int]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int trapWater(vector<int>& heights) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int trapWater(int[] heights) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} heights
 * @return {number}
 */
var trapWater = function (heights) {
  // your code here
  return 0
}
`,
  },
}

export const TWO_POINTER_PROBLEMS: CodingProblem[] = [
  mirrorMessage,
  canalDam,
  balancedTriples,
  budgetRepaint,
  rainBasin,
]
