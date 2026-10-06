import type { CodingProblem } from '../problemTypes'

/**
 * The first three problems, written when the judge was built. Kept as their own
 * file so `problems/index.ts` is the only place that knows the whole set.
 */


const pairSum: CodingProblem = {
  id: 'cp-pair-sum',
  title: 'Pair Sum',
  difficulty: 'Easy',
  topics: ['Array', 'Hash map'],
  roles: ['sde', 'quant'],
  statement: [
    'Given an integer array `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.',
    'At most one such pair exists. If there is none, return an empty array. You may not use the same element twice, and the indices you return must be in increasing order.',
    'The obvious double loop is `O(n²)` and will not finish inside the limit on the largest cases, so you need the linear idea: as you walk the array, ask whether the value you need has already been seen.',
  ],
  constraints: [
    '1 <= nums.length <= 200000',
    '-10^9 <= nums[i], target <= 10^9',
    'At most one valid pair exists',
  ],
  signature: {
    name: 'twoSum',
    params: [
      { name: 'nums', type: 'int[]' },
      { name: 'target', type: 'int' },
    ],
    returns: 'int[]',
  },
  cases: [
    { args: [[2, 7, 11, 15], 9], expected: [0, 1], note: 'nums[0] + nums[1] = 2 + 7 = 9.' },
    { args: [[1, 2, 3, 9], 6], expected: [], note: 'No two of these add to 6.' },
    { args: [[4, 4], 8], expected: [0, 1], note: 'Equal values are still two distinct indices.' },
    { args: [[-1, -2, -3, -4, -5], -9], expected: [3, 4], hidden: true },
    { args: [[5], 5], expected: [], hidden: true },
    { args: [[0, 0, 5], 0], expected: [0, 1], hidden: true },
    { args: [[999999, 1, 500000, 123, 3, 4, 5, 6], 1000000], expected: [0, 1], hidden: true },
    { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 19], expected: [8, 9], hidden: true },
  ],
  origin: { source: 'LeetCode', title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/' },
  hints: [
    'A hash map from value to the index where you last saw it turns "have I seen target − nums[i]?" into an O(1) question.',
    'Store a value only *after* you have looked for its complement. That is what stops a single element pairing with itself.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # your code here
        return []
`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // your code here
        return {};
    }
};
`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // your code here
        return new int[0];
    }
}
`,
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
  // your code here
  return []
}
`,
  },
}

const distinctWindow: CodingProblem = {
  id: 'cp-distinct-window',
  title: 'Longest Distinct Run',
  difficulty: 'Medium',
  topics: ['Sliding window', 'String', 'Hash map'],
  roles: ['sde'],
  statement: [
    'A run is a contiguous block of a string. A run is *clean* if no letter appears in it twice.',
    'Given a string `s`, return the length of its longest clean run.',
    'Restarting the scan from every index is `O(n²)`; the intended solution keeps one window and never moves the left edge backwards.',
  ],
  constraints: ['1 <= s.length <= 200000', 's consists of lowercase English letters only'],
  signature: {
    name: 'longestClean',
    params: [{ name: 's', type: 'string' }],
    returns: 'int',
  },
  cases: [
    { args: ['abcabcbb'], expected: 3, note: '"abc" is clean; extending it repeats a.' },
    { args: ['bbbbb'], expected: 1, note: 'Every clean run is a single letter.' },
    { args: ['pwwkew'], expected: 3, note: '"wke". "pwke" is not a run — it is not contiguous.' },
    { args: ['dvdf'], expected: 3, hidden: true },
    { args: ['tmmzuxt'], expected: 5, hidden: true },
    { args: ['abba'], expected: 2, hidden: true },
    { args: ['abcdefghijklmnopqrstuvwxyz'], expected: 26, hidden: true },
    { args: ['a'], expected: 1, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Longest Substring Without Repeating Characters',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
  },
  hints: [
    'Keep the last index at which each letter was seen. When the right edge lands on a repeat, the left edge jumps to just past that index.',
    '`abba` is the case that breaks the naive version: when the second `a` arrives, the left edge is already past the first `a`, so it must not move back.',
  ],
  starter: {
    python: `class Solution:
    def longestClean(self, s: str) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int longestClean(string s) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int longestClean(String s) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {string} s
 * @return {number}
 */
var longestClean = function (s) {
  // your code here
  return 0
}
`,
  },
}

const roomBooking: CodingProblem = {
  id: 'cp-room-booking',
  title: 'Room Booking',
  difficulty: 'Medium',
  topics: ['Greedy', 'Sorting', 'Intervals'],
  roles: ['sde', 'quant'],
  statement: [
    'The placement cell has one interview room and a list of requests for it. Request `i` runs from `bookings[i][0]` to `bookings[i][1]`.',
    'Two requests clash if their open intervals overlap. A booking that ends exactly when the next one starts does *not* clash — the room turns over instantly.',
    'Return the largest number of requests that can be accepted.',
    'Sorting by start time, or by duration, both give wrong answers on the hidden cases. There is one ordering that is provably optimal, and the proof is a two-line exchange argument worth knowing before an interview.',
  ],
  constraints: [
    '1 <= bookings.length <= 200000',
    'bookings[i].length == 2',
    '0 <= bookings[i][0] < bookings[i][1] <= 10^9',
  ],
  signature: {
    name: 'maxBookings',
    params: [{ name: 'bookings', type: 'int[][]' }],
    returns: 'int',
  },
  cases: [
    {
      args: [[[1, 3], [2, 4], [3, 5]]],
      expected: 2,
      note: 'Take 1–3 and 3–5. They touch, which is allowed.',
    },
    {
      args: [[[1, 2], [2, 3], [3, 4], [1, 4]]],
      expected: 3,
      note: 'The three short bookings beat the single long one.',
    },
    { args: [[[5, 10]]], expected: 1, note: 'Nothing to clash with.' },
    { args: [[[1, 4], [3, 5], [0, 6], [5, 7], [8, 9]]], expected: 3, hidden: true },
    { args: [[[1, 2], [1, 2], [1, 2], [1, 2], [1, 2], [1, 2]]], expected: 1, hidden: true },
    { args: [[[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 4, hidden: true },
    { args: [[[1, 100], [2, 3]]], expected: 1, hidden: true },
    {
      args: [[[7, 9], [0, 10], [4, 5], [8, 9], [4, 10], [5, 7], [3, 4]]],
      expected: 4,
      hidden: true,
    },
  ],
  origin: {
    source: 'Codeforces',
    title: 'Greedy interval scheduling (problemset, tag: greedy)',
    url: 'https://codeforces.com/problemset?tags=greedy%2C1200-1500',
  },
  hints: [
    'Ask which request you should accept *first*. The one that frees the room earliest leaves the most room for everything after it.',
    'Sort by end time, then sweep once keeping the finish time of the last accepted booking.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def maxBookings(self, bookings: List[List[int]]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int maxBookings(vector<vector<int>>& bookings) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int maxBookings(int[][] bookings) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[][]} bookings
 * @return {number}
 */
var maxBookings = function (bookings) {
  // your code here
  return 0
}
`,
  },
}

export const CORE_PROBLEMS: CodingProblem[] = [pairSum, distinctWindow, roomBooking]
