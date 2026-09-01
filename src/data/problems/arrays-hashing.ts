import type { CodingProblem } from '../problemTypes'

/**
 * Arrays, hash maps/sets, counting and prefix sums. Five problems, five
 * different techniques — prefix/suffix products, hash-set streak detection,
 * canonical-key bucketing, prefix-sum counting, and majority voting.
 */

const classPresident: CodingProblem = {
  id: 'cp-ar-class-president',
  title: 'Class President',
  difficulty: 'Easy',
  topics: ['Array', 'Counting'],
  roles: ['sde', 'quant'],
  statement: [
    'A class election was held and `votes[i]` is the roll number the `i`-th ballot was cast for. It is guaranteed that one candidate received strictly more than half of all the votes, so a president exists and is unique.',
    'Given `votes`, return the roll number of the class president.',
    'Counting every candidate with a hash map works, but there is a way to find the majority element using only a running total and no extra memory at all — think about what happens to a "current leader, current lead" pair as you scan past a vote for someone else.',
  ],
  constraints: ['1 <= votes.length <= 200000', '0 <= votes[i] <= 10^9', 'A strict majority element exists'],
  signature: {
    name: 'president',
    params: [{ name: 'votes', type: 'int[]' }],
    returns: 'int',
  },
  cases: [
    { args: [[3, 3, 4, 2, 3, 3, 3]], expected: 3, note: '3 appears 4 times out of 7 ballots.' },
    { args: [[7, 7]], expected: 7, note: 'The only candidate is the president.' },
    { args: [[1, 1, 1, 2, 2]], expected: 1, note: '3 out of 5 is a strict majority.' },
    { args: [[9]], expected: 9, hidden: true },
    { args: [[5, 5, 5, 5, 1, 2, 3, 4]], expected: 5, hidden: true },
    { args: [[2, 2, 1, 1, 1, 2, 2]], expected: 2, hidden: true },
    { args: [[0, 0, 0, 0, 0, 1, 1, 1, 1]], expected: 0, hidden: true },
    { args: [[8, 1, 8, 8, 2, 8, 8, 3, 8]], expected: 8, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Majority Element',
    url: 'https://leetcode.com/problems/majority-element/',
  },
  hints: [
    'Keep a candidate and a count starting at 0. On each vote: if count is 0, the candidate becomes this vote. Then add 1 if the vote matches the candidate, otherwise subtract 1.',
    'Because a strict majority element exists, it can never be fully cancelled out by every other vote combined — so whoever survives at the end is the answer.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def president(self, votes: List[int]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int president(vector<int>& votes) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int president(int[] votes) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} votes
 * @return {number}
 */
var president = function (votes) {
  // your code here
  return 0
}
`,
  },
}

const wordFamilies: CodingProblem = {
  id: 'cp-ar-word-families',
  title: 'Word Families',
  difficulty: 'Easy',
  topics: ['Array', 'Hash map', 'Sorting'],
  roles: ['sde'],
  statement: [
    'Two words belong to the same family if one can be rearranged into the other letter-for-letter — same multiset of letters, any order.',
    'Given a list `words`, group them into families. Return the families as a list of lists, where each inner list holds the *indices* of the words in that family.',
    'Order the families by the smallest index they contain, ascending. Within a family, list indices in increasing order.',
    'Comparing every pair of words directly is `O(n^2 * L)`. Instead, give every word a canonical label — something that is identical for two words exactly when they are in the same family — and group by that label with a hash map.',
  ],
  constraints: [
    '1 <= words.length <= 2000',
    '1 <= words[i].length <= 30',
    'words[i] consists of lowercase English letters only',
  ],
  signature: {
    name: 'wordFamilies',
    params: [{ name: 'words', type: 'string[]' }],
    returns: 'int[][]',
  },
  cases: [
    {
      args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']],
      expected: [
        [0, 1, 3],
        [2, 4],
        [5],
      ],
      note: '"eat"/"tea"/"ate" share a family, as do "tan"/"nat". "bat" is alone.',
    },
    { args: [['x']], expected: [[0]], note: 'A single word is its own family.' },
    { args: [['abc', 'bca', 'cab', 'xyz']], expected: [[0, 1, 2], [3]], note: 'Three rearrangements, one outsider.' },
    { args: [['aa', 'aa', 'a']], expected: [[0, 1], [2]], hidden: true },
    { args: [['ab', 'ba', 'ab', 'ba']], expected: [[0, 1, 2, 3]], hidden: true },
    {
      args: [['listen', 'silent', 'enlist', 'google', 'gogole']],
      expected: [
        [0, 1, 2],
        [3, 4],
      ],
      hidden: true,
    },
    { args: [['z', 'y', 'x', 'w']], expected: [[0], [1], [2], [3]], hidden: true },
    {
      args: [['abcd', 'dcba', 'wxyz', 'zyxw', 'abcd']],
      expected: [
        [0, 1, 4],
        [2, 3],
      ],
      hidden: true,
    },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Group Anagrams',
    url: 'https://leetcode.com/problems/group-anagrams/',
  },
  hints: [
    'Sort the letters of each word — anagrams collapse to the identical sorted string, which makes a perfectly good hash map key.',
    'Build a map from that key to a list of indices as you scan once, then read the map out sorted by each list\'s first (smallest) index.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def wordFamilies(self, words: List[str]) -> List[List[int]]:
        # your code here
        return []
`,
    cpp: `class Solution {
public:
    vector<vector<int>> wordFamilies(vector<string>& words) {
        // your code here
        return {};
    }
};
`,
    java: `class Solution {
    public int[][] wordFamilies(String[] words) {
        // your code here
        return new int[0][];
    }
}
`,
    javascript: `/**
 * @param {string[]} words
 * @return {number[][]}
 */
var wordFamilies = function (words) {
  // your code here
  return []
}
`,
  },
}

const scoreboardEcho: CodingProblem = {
  id: 'cp-ar-scoreboard-echo',
  title: 'Scoreboard Echo',
  difficulty: 'Medium',
  topics: ['Array', 'Prefix sum'],
  roles: ['sde', 'quant'],
  statement: [
    'A scoreboard shows one integer per player, `scores`. For every player, the app needs to display the product of every *other* player\'s score — their score if that player had not played at all.',
    'Given `scores`, return an array `echo` where `echo[i]` is the product of all elements of `scores` except `scores[i]`.',
    'Division is off the table: a score of `0` would break it, and the judge disallows floating point for this one. You also cannot use `long` arithmetic to sidestep overflow by computing the total product first — do it without ever dividing.',
    'A double loop is `O(n^2)`. The linear approach builds the answer from two passes: everything to the left of `i` multiplied together, and everything to the right.',
  ],
  constraints: ['2 <= scores.length <= 100000', '-20 <= scores[i] <= 20', 'The answer for every index fits in a 32-bit signed integer'],
  signature: {
    name: 'echo',
    params: [{ name: 'scores', type: 'int[]' }],
    returns: 'int[]',
  },
  cases: [
    { args: [[1, 2, 3, 4]], expected: [24, 12, 8, 6], note: 'echo[0] = 2*3*4 = 24, echo[3] = 1*2*3 = 6.' },
    { args: [[2, 3]], expected: [3, 2], note: 'Two players: each echo is just the other score.' },
    { args: [[1, 0, 3]], expected: [0, 3, 0], note: 'A single zero makes every echo except its own zero.' },
    { args: [[0, 0]], expected: [0, 0], hidden: true },
    { args: [[-1, 1, -1, 1]], expected: [-1, 1, -1, 1], hidden: true },
    { args: [[5, 5, 5, 5]], expected: [125, 125, 125, 125], hidden: true },
    { args: [[1, 2, 3, 4, 5, 6]], expected: [720, 360, 240, 180, 144, 120], hidden: true },
    { args: [[-2, -3, -4]], expected: [12, 8, 6], hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Product of Array Except Self',
    url: 'https://leetcode.com/problems/product-of-array-except-self/',
  },
  hints: [
    'First pass, left to right: `echo[i]` becomes the product of everything strictly before `i`.',
    'Second pass, right to left: multiply `echo[i]` by a running product of everything strictly after `i`, updating that running product as you go.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def echo(self, scores: List[int]) -> List[int]:
        # your code here
        return []
`,
    cpp: `class Solution {
public:
    vector<int> echo(vector<int>& scores) {
        // your code here
        return {};
    }
};
`,
    java: `class Solution {
    public int[] echo(int[] scores) {
        // your code here
        return new int[0];
    }
}
`,
    javascript: `/**
 * @param {number[]} scores
 * @return {number[]}
 */
var echo = function (scores) {
  // your code here
  return []
}
`,
  },
}

const longestBadgeChain: CodingProblem = {
  id: 'cp-ar-badge-chain',
  title: 'Longest Badge Chain',
  difficulty: 'Medium',
  topics: ['Array', 'Hash set'],
  roles: ['sde'],
  statement: [
    'Every member of a coding club has a badge number, given as `badges`. A *chain* is a set of members whose badge numbers are consecutive integers with no gaps, such as `7, 8, 9, 10` — order in the array does not matter, and duplicate badge numbers count once.',
    'Return the length of the longest chain that can be formed from `badges`.',
    'Sorting first gives an `O(n log n)` solution; it will pass, but it is not the intended one. The intended one runs in `O(n)`: put every badge number in a hash set, then only ever start counting a chain from a number whose predecessor is *not* in the set — that guarantees each chain is walked exactly once, start to end.',
  ],
  constraints: ['0 <= badges.length <= 200000', '-10^9 <= badges[i] <= 10^9'],
  signature: {
    name: 'longestChain',
    params: [{ name: 'badges', type: 'int[]' }],
    returns: 'int',
  },
  cases: [
    { args: [[100, 4, 200, 1, 3, 2]], expected: 4, note: 'The chain 1,2,3,4 has length 4.' },
    { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9, note: '0 through 8, with 0 repeated.' },
    { args: [[]], expected: 0, note: 'No members, no chain.' },
    { args: [[5]], expected: 1, hidden: true },
    { args: [[9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6]], expected: 7, hidden: true },
    { args: [[1, 2, 0, 1]], expected: 3, hidden: true },
    { args: [[-3, -2, -1, 0, 1, 2, 3]], expected: 7, hidden: true },
    { args: [[10, 20, 30, 40]], expected: 1, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Longest Consecutive Sequence',
    url: 'https://leetcode.com/problems/longest-consecutive-sequence/',
  },
  hints: [
    'Put every badge number in a hash set for O(1) membership checks.',
    'For each number `n` in the set, only start walking a chain upward from it if `n - 1` is absent — every other starting point would just re-walk a chain you already counted, which is what keeps the whole scan linear.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def longestChain(self, badges: List[int]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int longestChain(vector<int>& badges) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int longestChain(int[] badges) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} badges
 * @return {number}
 */
var longestChain = function (badges) {
  // your code here
  return 0
}
`,
  },
}

const donationBatches: CodingProblem = {
  id: 'cp-ar-donation-batches',
  title: 'Donation Batches',
  difficulty: 'Hard',
  topics: ['Array', 'Hash map', 'Prefix sum'],
  roles: ['sde', 'quant'],
  statement: [
    'A charity drive logs one donation per entry in `donations` — entries can be negative, since a logged refund subtracts from the running total. Given a target amount `goal`, count how many contiguous stretches of the log (subarrays) sum to exactly `goal`.',
    'Two stretches are different if they cover different index ranges, even if every donation in them happens to be equal.',
    'Checking every stretch directly is `O(n^2)`. The linear idea: track the running prefix sum as you scan, and for each position ask how many earlier prefix sums are exactly `goal` less than the current one — a hash map turns that question into `O(1)` per step.',
  ],
  constraints: ['1 <= donations.length <= 200000', '-1000 <= donations[i] <= 1000', '-10^9 <= goal <= 10^9'],
  signature: {
    name: 'countBatches',
    params: [
      { name: 'donations', type: 'int[]' },
      { name: 'goal', type: 'int' },
    ],
    returns: 'int',
  },
  cases: [
    { args: [[1, 1, 1], 2], expected: 2, note: 'donations[0..1] and donations[1..2] both sum to 2.' },
    { args: [[1, 2, 3], 3], expected: 2, note: '[1,2] and the lone [3] both work.' },
    { args: [[1, -1, 0], 0], expected: 3, note: '[1,-1], [0], and [1,-1,0] all sum to 0.' },
    { args: [[0, 0, 0, 0], 0], expected: 10, hidden: true },
    { args: [[5], 5], expected: 1, hidden: true },
    { args: [[5], 4], expected: 0, hidden: true },
    { args: [[3, 4, 7, 2, -3, 1, 4, 2], 7], expected: 4, hidden: true },
    { args: [[-1, -1, 1, 1, 1, -1, -1], 0], expected: 6, hidden: true },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Subarray Sum Equals K',
    url: 'https://leetcode.com/problems/subarray-sum-equals-k/',
  },
  hints: [
    'Keep a hash map from "prefix sum seen so far" to "how many times it has occurred", seeded with `{0: 1}` for the empty prefix before index 0.',
    'At each step, add the running sum to the map only *after* checking how many times `runningSum - goal` has already appeared — that count is exactly how many subarrays ending here sum to `goal`.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def countBatches(self, donations: List[int], goal: int) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int countBatches(vector<int>& donations, int goal) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int countBatches(int[] donations, int goal) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[]} donations
 * @param {number} goal
 * @return {number}
 */
var countBatches = function (donations, goal) {
  // your code here
  return 0
}
`,
  },
}

export const ARRAYS_PROBLEMS: CodingProblem[] = [
  classPresident,
  wordFamilies,
  scoreboardEcho,
  longestBadgeChain,
  donationBatches,
]
