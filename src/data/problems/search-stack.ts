import type { CodingProblem } from '../problemTypes'

/**
 * Binary search (including binary search on the answer), monotonic stacks,
 * and heap/selection. Five problems, `cp-se-` prefix.
 */

const firstFitBin: CodingProblem = {
  id: 'cp-se-first-fit-bin',
  title: 'First Bin That Fits',
  difficulty: 'Easy',
  topics: ['Binary search', 'Array'],
  roles: ['sde', 'quant'],
  statement: [
    'A warehouse keeps its storage bins sorted by capacity, smallest first. `capacities[i]` is the maximum weight bin `i` can hold.',
    'A parcel of weight `weight` needs a bin. Return the index of the leftmost bin whose capacity is at least `weight`. If every bin is too small, return `-1`.',
    'Walking the array from the front is `O(n)` per parcel. Because `capacities` is already sorted, the leftmost bin that is big enough can be found in `O(log n)` with binary search.',
  ],
  constraints: [
    '1 <= capacities.length <= 200000',
    '1 <= capacities[i] <= 10^9',
    '`capacities` is sorted in non-decreasing order',
    '1 <= weight <= 10^9',
  ],
  signature: {
    name: 'firstFit',
    params: [
      { name: 'capacities', type: 'int[]' },
      { name: 'weight', type: 'int' },
    ],
    returns: 'int',
  },
  cases: [
    {
      args: [[5, 10, 10, 20, 50], 12],
      expected: 3,
      note: 'Both bins of capacity 10 are too small; the bin of capacity 20 at index 3 is the first that fits.',
    },
    { args: [[5, 10, 10, 20, 50], 51], expected: -1, note: 'No bin can hold 51.' },
    {
      args: [[5, 10, 10, 20, 50], 5],
      expected: 0,
      note: 'A capacity exactly equal to the weight counts as fitting.',
    },
    { args: [[7], 7], expected: 0, hidden: true },
    { args: [[7], 8], expected: -1, hidden: true },
    { args: [[1, 1, 1, 1, 1], 1], expected: 0, hidden: true },
    { args: [[2, 4, 6, 8, 10, 12, 14, 16, 18, 20], 15], expected: 7, hidden: true },
    { args: [[1000000000], 1000000000], expected: 0, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Search Insert Position',
    url: 'https://leetcode.com/problems/search-insert-position/',
  },
  hints: [
    'This is a lower-bound search: keep a range `[lo, hi)` of candidate indices and narrow it by checking `capacities[mid]` against `weight`.',
    'When `capacities[mid] >= weight`, the answer could still be `mid` or something to its left, so pull `hi` down to `mid` rather than `mid - 1` — do not throw the candidate away.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def firstFit(self, capacities: List[int], weight: int) -> int:
        # your code here
        return -1
`,
    cpp: `class Solution {
public:
    int firstFit(vector<int>& capacities, int weight) {
        // your code here
        return -1;
    }
};
`,
    java: `class Solution {
    public int firstFit(int[] capacities, int weight) {
        // your code here
        return -1;
    }
}
`,
    javascript: `/**
 * @param {number[]} capacities
 * @param {number} weight
 * @return {number}
 */
var firstFit = function (capacities, weight) {
  // your code here
  return -1
}
`,
  },
}

const convoyCapacity: CodingProblem = {
  id: 'cp-se-conveyor-load',
  title: 'Convoy Capacity',
  difficulty: 'Medium',
  topics: ['Binary search on answer', 'Greedy'],
  roles: ['sde'],
  statement: [
    'A convoy must move `parcels` from the loading dock to the depot. Parcel `i` weighs `parcels[i]` kilograms, and parcels are loaded onto trucks strictly in the given order — you may not reorder them or split one parcel across two runs.',
    'Every run the convoy makes can carry parcels whose combined weight does not exceed the convoy\'s capacity, and the convoy can make at most `days` runs in total.',
    'Return the smallest capacity that gets every parcel moved within `days` runs.',
    'Checking whether a capacity works is cheap: pack parcels onto the current run greedily, start a new run when the next parcel would overflow it, and count runs. Testing every capacity from 1 upward is too slow — binary search over the capacity itself, using that check to throw away half the range each time.',
  ],
  constraints: [
    '1 <= parcels.length <= 200000',
    '1 <= parcels[i] <= 10^7',
    '1 <= days <= parcels.length',
  ],
  signature: {
    name: 'minCapacity',
    params: [
      { name: 'parcels', type: 'int[]' },
      { name: 'days', type: 'int' },
    ],
    returns: 'int',
  },
  cases: [
    {
      args: [[10, 10, 10, 10, 10], 2],
      expected: 30,
      note: 'Capacity 30 splits it into 10+10+10 then 10+10; nothing smaller fits into 2 runs.',
    },
    {
      args: [[3, 1, 4, 1, 5, 9, 2, 6], 3],
      expected: 14,
      note: 'Order matters — the parcels must load as 3,1,4,1,5,9,2,6, not sorted.',
    },
    {
      args: [[100], 1],
      expected: 100,
      note: 'A single parcel forces the capacity to be at least its own weight.',
    },
    { args: [[5, 5, 5, 5, 5, 5, 5, 5], 8], expected: 5, hidden: true },
    { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9], 5], expected: 11, hidden: true },
    { args: [[4, 4, 4, 4], 4], expected: 4, hidden: true },
    { args: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 2], expected: 5, hidden: true },
    { args: [[50, 20, 30, 10, 40], 2], expected: 80, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Capacity To Ship Packages Within D Days',
    url: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/',
  },
  hints: [
    'The answer lies between `max(parcels)` (a run can never carry less than the heaviest single parcel) and `sum(parcels)` (everything in one run).',
    'Write a `runsNeeded(capacity)` helper and binary search the smallest capacity for which it returns `<= days` — the function is monotonic, so the usual lower-bound template applies.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def minCapacity(self, parcels: List[int], days: int) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int minCapacity(vector<int>& parcels, int days) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int minCapacity(int[] parcels, int days) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} parcels
 * @param {number} days
 * @return {number}
 */
var minCapacity = function (parcels, days) {
  // your code here
  return 0
}
`,
  },
}

const nextLivelierDay: CodingProblem = {
  id: 'cp-se-next-livelier-day',
  title: 'Next Livelier Day',
  difficulty: 'Medium',
  topics: ['Monotonic stack', 'Array'],
  roles: ['sde'],
  statement: [
    'The fest committee logged a noise-meter reading for each day of the fest, `decibels[i]` for day `i`.',
    'For every day, return how many days you must wait for a strictly louder day to arrive. If no louder day ever comes, the answer for that day is `0`.',
    'Return the answers as an array, one entry per day, in the same order as `decibels`.',
    'Re-scanning forward from every day is `O(n²)`. Keep a stack of days whose louder day has not shown up yet, and resolve several of them at once whenever a new reading beats what is on top.',
  ],
  constraints: ['1 <= decibels.length <= 200000', '0 <= decibels[i] <= 1000000'],
  signature: {
    name: 'waitForLouder',
    params: [{ name: 'decibels', type: 'int[]' }],
    returns: 'int[]',
  },
  cases: [
    {
      args: [[70, 71, 69, 72, 76, 73, 69, 75]],
      expected: [1, 2, 1, 1, 0, 2, 1, 0],
      note: 'Day 0 (70) waits 1 day for 71; day 4 (76) is never beaten, so it gets 0.',
    },
    {
      args: [[80, 80, 80]],
      expected: [0, 0, 0],
      note: 'Equal is not louder — repeats never resolve each other.',
    },
    {
      args: [[90, 80, 70, 60]],
      expected: [0, 0, 0, 0],
      note: 'Strictly decreasing: nothing ahead of any day is louder.',
    },
    { args: [[60, 70, 80, 90]], expected: [1, 1, 1, 0], hidden: true },
    { args: [[50]], expected: [0], hidden: true },
    { args: [[65, 60, 70, 60, 75, 80, 55, 90]], expected: [2, 1, 2, 1, 1, 2, 1, 0], hidden: true },
    { args: [[100, 90, 95, 85, 100]], expected: [0, 1, 2, 1, 0], hidden: true },
    { args: [[1, 1, 1, 2, 1, 1, 1]], expected: [3, 2, 1, 0, 0, 0, 0], hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Daily Temperatures',
    url: 'https://leetcode.com/problems/daily-temperatures/',
  },
  hints: [
    'Keep a stack of indices whose answer is still unknown. Its readings are decreasing from bottom to top.',
    'When day `i` arrives, pop every index on the stack whose reading is lower than `decibels[i]` and set that index\'s answer to `i - poppedIndex`, then push `i`.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def waitForLouder(self, decibels: List[int]) -> List[int]:
        # your code here
        return [0] * len(decibels)
`,
    cpp: `class Solution {
public:
    vector<int> waitForLouder(vector<int>& decibels) {
        // your code here
        return vector<int>(decibels.size(), 0);
    }
};
`,
    java: `class Solution {
    public int[] waitForLouder(int[] decibels) {
        // your code here
        return new int[decibels.length];
    }
}
`,
    javascript: `/**
 * @param {number[]} decibels
 * @return {number[]}
 */
var waitForLouder = function (decibels) {
  // your code here
  return new Array(decibels.length).fill(0)
}
`,
  },
}

const kthTopper: CodingProblem = {
  id: 'cp-se-kth-topper',
  title: 'Kth Topper',
  difficulty: 'Medium',
  topics: ['Heap', 'Selection', 'Array'],
  roles: ['sde', 'quant'],
  statement: [
    'A leaderboard holds `scores`, one entry per participant, in no particular order.',
    'Return the `k`-th highest score, where `k = 1` means the top score, `k = 2` means the runner-up, and so on. Duplicate scores each occupy their own rank — `[9, 9, 8]` has a 1st place, a 2nd place, and a 3rd place, not a tie for 1st.',
    'Sorting the whole board is `O(n log n)` and is an acceptable answer here, but it re-does work you do not need: you only ever want the top `k`, not a full order. A heap of size `k` (or a partial selection) gets there in `O(n log k)`, which matters once the leaderboard is large and `k` is small.',
  ],
  constraints: ['1 <= scores.length <= 200000', '-10^9 <= scores[i] <= 10^9', '1 <= k <= scores.length'],
  signature: {
    name: 'kthTopper',
    params: [
      { name: 'scores', type: 'int[]' },
      { name: 'k', type: 'int' },
    ],
    returns: 'int',
  },
  cases: [
    {
      args: [[9, 3, 7, 3, 5, 1, 8], 2],
      expected: 8,
      note: 'Sorted descending: 9, 8, 7, 5, 3, 3, 1 — the 2nd entry is 8.',
    },
    {
      args: [[4, 4, 4, 4], 3],
      expected: 4,
      note: 'Every entry ties, but each still counts as its own rank.',
    },
    { args: [[2, 1], 1], expected: 2, note: 'k = 1 is just the maximum.' },
    { args: [[2, 1], 2], expected: 1, hidden: true },
    { args: [[5], 1], expected: 5, hidden: true },
    { args: [[-1, -5, -3, -2, -4], 1], expected: -1, hidden: true },
    { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4, hidden: true },
    { args: [[1000000000, -1000000000, 0], 3], expected: -1000000000, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Kth Largest Element in an Array',
    url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
  },
  hints: [
    'A min-heap that is never allowed to grow past size `k` always has the k-th largest value seen so far sitting at its top once it fills up.',
    'Push every score; whenever the heap exceeds size `k`, pop its smallest. What remains on top when you are done is the answer.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def kthTopper(self, scores: List[int], k: int) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int kthTopper(vector<int>& scores, int k) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int kthTopper(int[] scores, int k) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} scores
 * @param {number} k
 * @return {number}
 */
var kthTopper = function (scores, k) {
  // your code here
  return 0
}
`,
  },
}

const widestShelfSpan: CodingProblem = {
  id: 'cp-se-widest-shelf-span',
  title: 'Widest Shelf Span',
  difficulty: 'Hard',
  topics: ['Monotonic stack', 'Array'],
  roles: ['sde'],
  statement: [
    'A warehouse aisle is a row of unit-width shelving columns. Column `i` is stacked `heights[i]` crates high.',
    'A banner can be pinned across any contiguous run of columns, but it can only hang as high as the *shortest* column in that run — anything taller would poke through the banner. Its area is that shortest height times the number of columns it spans.',
    'Return the largest banner area achievable over any contiguous run of columns (a run of length 1 is allowed).',
    'Trying every pair of endpoints is `O(n²)`, and for every run you still have to find its minimum. Keep a stack of column indices with non-decreasing heights: the moment a shorter column arrives, every taller column behind it now knows exactly how far right its banner could have reached, so it can be resolved immediately.',
  ],
  constraints: ['1 <= heights.length <= 100000', '0 <= heights[i] <= 10000'],
  signature: {
    name: 'maxPanelArea',
    params: [{ name: 'heights', type: 'int[]' }],
    returns: 'int',
  },
  cases: [
    {
      args: [[2, 1, 5, 6, 2, 3]],
      expected: 10,
      note: 'Columns of height 5 and 6 (indices 2–3) give a banner of height 5 across width 2.',
    },
    {
      args: [[2, 4]],
      expected: 4,
      note: 'Either single column (area 4 or 2) or both together (min 2, width 2, area 4) — 4 wins.',
    },
    { args: [[1, 1, 1, 1]], expected: 4, note: 'The whole row is flat, so take it all.' },
    { args: [[5, 4, 3, 2, 1]], expected: 9, hidden: true },
    { args: [[1, 2, 3, 4, 5]], expected: 9, hidden: true },
    { args: [[0, 0, 0]], expected: 0, hidden: true },
    { args: [[6]], expected: 6, hidden: true },
    { args: [[3, 6, 5, 7, 4, 8, 1, 0]], expected: 20, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Largest Rectangle in Histogram',
    url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/',
  },
  hints: [
    'Push a sentinel height of 0 past the end of the array so every column left on the stack gets closed out.',
    'When you pop a column because a shorter one arrived, its left boundary is whatever is now below it on the stack (or the very start, if the stack is empty) — that gap is its width.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def maxPanelArea(self, heights: List[int]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int maxPanelArea(vector<int>& heights) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int maxPanelArea(int[] heights) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} heights
 * @return {number}
 */
var maxPanelArea = function (heights) {
  // your code here
  return 0
}
`,
  },
}

export const SEARCH_PROBLEMS: CodingProblem[] = [
  firstFitBin,
  convoyCapacity,
  nextLivelierDay,
  kthTopper,
  widestShelfSpan,
]
