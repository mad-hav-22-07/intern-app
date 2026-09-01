import type { CodingProblem } from '../problemTypes'

/**
 * Graphs as edge lists and grids, union-find, topological order, multi-source
 * BFS, and one bit-manipulation problem. See `docs/AUTHORING-PROBLEMS.md`.
 */

const landBlocks: CodingProblem = {
  id: 'cp-gr-land-blocks',
  title: 'Land Blocks',
  difficulty: 'Easy',
  topics: ['Grid', 'BFS/DFS', 'Graph'],
  roles: ['sde'],
  statement: [
    'A drone survey turns a rectangular field into a grid `field`, where `field[r][c]` is `1` if that patch is dry land and `0` if it is flooded.',
    'Two land patches belong to the same block if you can walk between them stepping only up, down, left or right through land — a diagonal step does not connect them.',
    'Return the number of separate land blocks in the field.',
    'The grid can be up to 300 by 300, so the trick is not speed — it is making sure each land cell is visited exactly once. A recursive scan that revisits cells will double-count or, on one huge block, blow the call stack.',
  ],
  constraints: [
    '1 <= field.length, field[0].length <= 300',
    'Every row of field has the same length',
    'field[r][c] is 0 or 1',
  ],
  signature: {
    name: 'countLandBlocks',
    params: [{ name: 'field', type: 'int[][]' }],
    returns: 'int',
  },
  cases: [
    {
      args: [
        [
          [1, 1, 0, 0],
          [1, 1, 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1],
        ],
      ],
      expected: 3,
      note: 'The 2×2 block top-left is one block; the two lone cells are one block each.',
    },
    {
      args: [
        [
          [0, 0, 0],
          [0, 0, 0],
        ],
      ],
      expected: 0,
      note: 'No land at all.',
    },
    { args: [[[1]]], expected: 1, note: 'A single land cell is its own block.' },
    { args: [[[1, 0, 1, 0, 1]]], expected: 3, hidden: true },
    {
      args: [
        [
          [1, 1],
          [1, 1],
        ],
      ],
      expected: 1,
      hidden: true,
    },
    {
      args: [
        [
          [1, 0],
          [0, 1],
        ],
      ],
      expected: 2,
      hidden: true,
    },
    {
      args: [
        [
          [1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1],
        ],
      ],
      expected: 1,
      hidden: true,
    },
    {
      args: [
        [
          [1, 1, 0, 1],
          [1, 0, 0, 1],
          [0, 0, 1, 1],
          [1, 1, 0, 0],
        ],
      ],
      expected: 3,
      hidden: true,
    },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Number of Islands',
    url: 'https://leetcode.com/problems/number-of-islands/',
  },
  hints: [
    'Scan the grid once. The moment you find an unvisited `1`, that is a new block — flood-fill outward from it (up/down/left/right only) and mark everything you touch as visited.',
    'Use an explicit queue or stack, not plain recursion. A single block can cover all 90000 cells of a 300×300 grid, deeper than Python\'s default recursion limit.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def countLandBlocks(self, field: List[List[int]]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int countLandBlocks(vector<vector<int>>& field) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int countLandBlocks(int[][] field) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[][]} field
 * @return {number}
 */
var countLandBlocks = function (field) {
  // your code here
  return 0
}
`,
  },
}

const outageSpread: CodingProblem = {
  id: 'cp-gr-outage-spread',
  title: 'Outage Spread',
  difficulty: 'Medium',
  topics: ['Grid', 'BFS', 'Multi-source BFS'],
  roles: ['sde'],
  statement: [
    'A datacenter floor is a grid `floor`. `0` is an empty rack slot, `1` is a healthy running server, `2` is a server that has already failed.',
    'Every minute, every currently failed server causes each healthy server directly above, below, left or right of it (never diagonal) to fail too. All of a minute\'s new failures happen together, and only then does the next minute begin.',
    'Return the number of minutes that pass until no healthy server is left. If some healthy server is never reachable — no chain of adjacent servers connects it to a failed one — the floor never finishes failing, so return `-1`. If there were no healthy servers to begin with, the answer is `0`.',
    'This is one flood fill that starts from every failed server at once, not one flood fill per server — start all of them on the same queue so minute 1 for one failure and minute 1 for another line up correctly.',
  ],
  constraints: ['1 <= floor.length, floor[0].length <= 500', 'floor[r][c] is 0, 1, or 2'],
  signature: {
    name: 'minutesToFail',
    params: [{ name: 'floor', type: 'int[][]' }],
    returns: 'int',
  },
  cases: [
    {
      args: [
        [
          [2, 1, 1],
          [1, 1, 0],
          [0, 1, 1],
        ],
      ],
      expected: 4,
      note: 'The failure needs four rounds to reach the bottom-right corner.',
    },
    { args: [[[0, 1, 2]]], expected: 1, note: 'One healthy server, one minute away from the failed one.' },
    { args: [[[0, 2]]], expected: 0, note: 'No healthy servers to begin with.' },
    { args: [[[1, 2]]], expected: 1, hidden: true },
    { args: [[[1]]], expected: -1, hidden: true, note: 'Nothing ever fails: there is no source at all.' },
    { args: [[[2]]], expected: 0, hidden: true },
    {
      args: [[[2, 1, 0, 1]]],
      expected: -1,
      hidden: true,
      note: 'The last server is cut off from the rest by an empty slot — it can never fail.',
    },
    {
      args: [
        [
          [2, 1, 1, 2],
          [1, 1, 0, 1],
          [0, 1, 1, 1],
        ],
      ],
      expected: 3,
      hidden: true,
    },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Rotting Oranges',
    url: 'https://leetcode.com/problems/rotting-oranges/',
  },
  hints: [
    'Push every already-failed cell onto the BFS queue before you start, all at distance 0. The queue naturally advances one whole minute at a time from there.',
    'Count healthy servers up front. If the number your BFS actually reaches is smaller than that count, something was unreachable — return `-1`.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def minutesToFail(self, floor: List[List[int]]) -> int:
        # your code here
        return 0
`,
    cpp: `class Solution {
public:
    int minutesToFail(vector<vector<int>>& floor) {
        // your code here
        return 0;
    }
};
`,
    java: `class Solution {
    public int minutesToFail(int[][] floor) {
        // your code here
        return 0;
    }
}
`,
    javascript: `/**
 * @param {number[][]} floor
 * @return {number}
 */
var minutesToFail = function (floor) {
  // your code here
  return 0
}
`,
  },
}

const semesterPlan: CodingProblem = {
  id: 'cp-gr-semester-plan',
  title: 'Semester Plan',
  difficulty: 'Medium',
  topics: ['Graph', 'Topological sort', 'Greedy'],
  roles: ['sde'],
  statement: [
    'A degree has `n` courses labelled `0` to `n - 1`. Each entry `prereqs[i] = [a, b]` means course `a` must be finished before course `b` can be taken.',
    'Return an order to take all `n` courses that respects every prerequisite — specifically, the *lexicographically smallest* such order: compare two candidate orders position by position, and the one with the smaller course number at the first place they differ wins.',
    'If the prerequisites are contradictory (some course indirectly requires itself), no order exists — return an empty array.',
    'The usual "any valid order" topological sort (a DFS post-order, reversed) does not give you the smallest one. You need to always take whichever available course has the smallest number next, which means picking from among *all* currently available courses, not just following one DFS branch to the end.',
  ],
  constraints: [
    '1 <= n <= 2000',
    '0 <= prereqs.length <= 4000',
    'prereqs[i].length == 2',
    '0 <= prereqs[i][0], prereqs[i][1] < n',
    'prereqs[i][0] != prereqs[i][1]',
  ],
  signature: {
    name: 'semesterPlan',
    params: [
      { name: 'n', type: 'int' },
      { name: 'prereqs', type: 'int[][]' },
    ],
    returns: 'int[]',
  },
  cases: [
    {
      args: [
        4,
        [
          [1, 0],
          [2, 0],
          [3, 1],
          [3, 2],
        ],
      ],
      expected: [3, 1, 2, 0],
      note: 'Only course 3 has no prerequisite, so it must go first; then 1 and 2 both open up and 1 is smaller.',
    },
    {
      args: [
        2,
        [
          [0, 1],
          [1, 0],
        ],
      ],
      expected: [],
      note: '0 needs 1 and 1 needs 0 — a cycle, so no order works.',
    },
    { args: [1, []], expected: [0], note: 'One course, nothing required first.' },
    { args: [3, []], expected: [0, 1, 2], hidden: true },
    {
      args: [
        5,
        [
          [0, 2],
          [1, 2],
          [2, 3],
          [2, 4],
        ],
      ],
      expected: [0, 1, 2, 3, 4],
      hidden: true,
    },
    {
      args: [
        4,
        [
          [0, 1],
          [1, 2],
          [2, 0],
          [0, 3],
        ],
      ],
      expected: [],
      hidden: true,
      note: 'The cycle among 0, 1, 2 makes the whole plan impossible, even though 3 is fine on its own.',
    },
    {
      args: [
        4,
        [
          [1, 0],
          [2, 0],
          [2, 3],
        ],
      ],
      expected: [1, 2, 0, 3],
      hidden: true,
      note: 'A DFS starting from course 0 finishes 0 first and returns [2, 3, 1, 0] reversed — smaller, but not respecting that 1 has no prerequisite and could go before 2.',
    },
    {
      args: [
        6,
        [
          [0, 1],
          [0, 2],
          [1, 3],
          [2, 3],
          [3, 4],
          [3, 5],
        ],
      ],
      expected: [0, 1, 2, 3, 4, 5],
      hidden: true,
    },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Course Schedule II',
    url: 'https://leetcode.com/problems/course-schedule-ii/',
  },
  hints: [
    'This is Kahn\'s algorithm: track how many prerequisites each course still has left, and a course becomes available the moment that count hits zero.',
    'Keep the available courses in a min-heap instead of a plain list or queue, so you always pop the smallest one next.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def semesterPlan(self, n: int, prereqs: List[List[int]]) -> List[int]:
        # your code here
        return []
`,
    cpp: `class Solution {
public:
    vector<int> semesterPlan(int n, vector<vector<int>>& prereqs) {
        // your code here
        return {};
    }
};
`,
    java: `class Solution {
    public int[] semesterPlan(int n, int[][] prereqs) {
        // your code here
        return new int[0];
    }
}
`,
    javascript: `/**
 * @param {number} n
 * @param {number[][]} prereqs
 * @return {number[]}
 */
var semesterPlan = function (n, prereqs) {
  // your code here
  return []
}
`,
  },
}

const redundantCable: CodingProblem = {
  id: 'cp-gr-redundant-cable',
  title: 'Redundant Cable',
  difficulty: 'Medium',
  topics: ['Graph', 'Union-Find'],
  roles: ['sde'],
  statement: [
    'A campus network was meant to wire `n` server racks, numbered `1` to `n`, into a tree — connected, with no loops. Instead, exactly one extra cable was laid by mistake, so the `n` cables given in `edges` (one more than a tree needs) create exactly one loop.',
    '`edges[i] = [u, v]` is a cable laid, in order, directly between racks `u` and `v`. Return the one cable you can cut so the remaining `n - 1` cables again connect all `n` racks with no loop. If more than one cable lies on the loop, return whichever of them was laid last — i.e., appears latest in `edges`.',
    'The answer is always unique: with `n` racks and exactly `n` cables forming one connected network, there is exactly one loop, and only one cable on it was laid last.',
  ],
  constraints: [
    'n == edges.length',
    '3 <= n <= 1000',
    'edges[i].length == 2',
    '1 <= edges[i][0] < edges[i][1] <= n',
    'No two cables connect the same pair of racks, and the n cables connect all n racks',
  ],
  signature: {
    name: 'findRedundant',
    params: [{ name: 'edges', type: 'int[][]' }],
    returns: 'int[]',
  },
  cases: [
    {
      args: [
        [
          [1, 2],
          [1, 3],
          [2, 3],
        ],
      ],
      expected: [2, 3],
      note: '1–2 and 1–3 already connect all three racks; 2–3 closes the loop.',
    },
    {
      args: [
        [
          [1, 2],
          [2, 3],
          [3, 4],
          [1, 4],
          [1, 5],
        ],
      ],
      expected: [1, 4],
      note: 'Rack 5 hangs off rack 1 and is not part of the loop at all.',
    },
    {
      args: [
        [
          [1, 4],
          [3, 4],
          [1, 3],
          [1, 2]
        ],
      ],
      expected: [1, 3],
      note: 'By the time 1–3 is laid, 1 and 3 are already connected through 4.',
    },
    {
      args: [
        [
          [1, 2],
          [2, 3],
          [1, 3],
        ],
      ],
      expected: [1, 3],
      hidden: true,
    },
    {
      args: [
        [
          [1, 2],
          [1, 3],
          [3, 4],
          [4, 5],
          [3, 5],
          [1, 6],
        ],
      ],
      expected: [3, 5],
      hidden: true,
    },
    {
      args: [
        [
          [1, 2],
          [2, 3],
          [3, 4],
          [2, 4],
          [4, 5],
        ],
      ],
      expected: [2, 4],
      hidden: true,
    },
    {
      args: [
        [
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [5, 6],
          [6, 7],
          [1, 7],
        ],
      ],
      expected: [1, 7],
      hidden: true,
      note: 'A plain ring of 7 racks — the closing cable is the obvious answer.',
    },
    {
      args: [
        [
          [1, 2],
          [1, 3],
          [2, 4],
          [2, 5],
          [3, 6],
          [3, 7],
          [6, 8],
          [7, 8],
        ],
      ],
      expected: [7, 8],
      hidden: true,
    },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Redundant Connection',
    url: 'https://leetcode.com/problems/redundant-connection/',
  },
  hints: [
    'Union-find: process the cables in order, and try to union the two racks each one touches. The instant a union fails because the two racks are already in the same component, that cable is your answer — stop right there.',
    'You never need to look ahead at later cables. The input guarantees exactly one loop, so the first union that fails is provably the last cable of that loop.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def findRedundant(self, edges: List[List[int]]) -> List[int]:
        # your code here
        return []
`,
    cpp: `class Solution {
public:
    vector<int> findRedundant(vector<vector<int>>& edges) {
        // your code here
        return {};
    }
};
`,
    java: `class Solution {
    public int[] findRedundant(int[][] edges) {
        // your code here
        return new int[0];
    }
}
`,
    javascript: `/**
 * @param {number[][]} edges
 * @return {number[]}
 */
var findRedundant = function (edges) {
  // your code here
  return []
}
`,
  },
}

const twinLoners: CodingProblem = {
  id: 'cp-gr-twin-loners',
  title: 'Twin Loners',
  difficulty: 'Hard',
  topics: ['Bit manipulation', 'Array'],
  roles: ['sde', 'quant'],
  statement: [
    'An access log `ids` records a device ID every time it connects. Every device shows up in the log exactly twice — except exactly two devices, which show up exactly once each and are different from one another.',
    'Return those two devices, in increasing order.',
    'A hash map gets there in `O(n)` time and `O(n)` extra space; the sharper target is `O(n)` time and `O(1)` extra space (beyond the pair you return). XOR everything together, keep only a bit that the two loners disagree on, and split the log in two along that bit.',
  ],
  constraints: [
    '2 <= ids.length <= 200000',
    'ids.length is even',
    '-1000000 <= ids[i] <= 1000000',
    'Every value appears exactly twice, except exactly two values, which appear exactly once and differ from each other',
  ],
  signature: {
    name: 'findLoners',
    params: [{ name: 'ids', type: 'int[]' }],
    returns: 'int[]',
  },
  cases: [
    { args: [[1, 2, 1, 3, 2, 5]], expected: [3, 5], note: '1 and 2 each show up twice; 3 and 5 are the loners.' },
    { args: [[0, 1]], expected: [0, 1], note: 'Nothing repeats at all — both entries are loners.' },
    { args: [[4, 4, -1, 7]], expected: [-1, 7], note: 'Negative values work the same way.' },
    { args: [[10, 20, 10, 20, 30, 40]], expected: [30, 40], hidden: true },
    { args: [[-5, -5, -3, -9]], expected: [-9, -3], hidden: true },
    { args: [[1000000, -1000000, 5, 5]], expected: [-1000000, 1000000], hidden: true },
    { args: [[7, 3, 5, 3, 5, 9]], expected: [7, 9], hidden: true },
    {
      args: [
        (() => {
          const ids: number[] = []
          for (let i = 1; i <= 200; i++) ids.push(i, i)
          ids.push(-1000000, 999999)
          return ids
        })(),
      ],
      expected: [-1000000, 999999],
      hidden: true,
    },
  ],
  origin: {
    source: 'LeetCode',
    title: 'Single Number III',
    url: 'https://leetcode.com/problems/single-number-iii/',
  },
  hints: [
    'XOR the whole log together. Every paired value cancels out, so what is left is the XOR of the two loners — call it `diff`.',
    '`diff` is nonzero, so it has some set bit: the two loners must differ there (otherwise that bit would have cancelled too). `diff & (-diff)` isolates its lowest set bit; split the log by whether each value has that bit set, and XOR within each half to recover one loner apiece.',
  ],
  starter: {
    python: `from typing import List

class Solution:
    def findLoners(self, ids: List[int]) -> List[int]:
        # your code here
        return []
`,
    cpp: `class Solution {
public:
    vector<int> findLoners(vector<int>& ids) {
        // your code here
        return {};
    }
};
`,
    java: `class Solution {
    public int[] findLoners(int[] ids) {
        // your code here
        return new int[0];
    }
}
`,
    javascript: `/**
 * @param {number[]} ids
 * @return {number[]}
 */
var findLoners = function (ids) {
  // your code here
  return []
}
`,
  },
}

export const GRAPH_PROBLEMS: CodingProblem[] = [
  landBlocks,
  outageSpread,
  semesterPlan,
  redundantCable,
  twinLoners,
]
