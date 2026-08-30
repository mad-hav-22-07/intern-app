import type { RoleId } from './roles'

/**
 * The practice question bank.
 *
 * Every row is a **pointer to the real problem on the platform that owns it**:
 * title, source, difficulty, topics and a link. The problem statements
 * themselves are not copied here. That is deliberate and not laziness: the text
 * belongs to LeetCode, Brainstellar and HackerRank, and reproducing it would be
 * both a licensing problem and a maintenance one, since problems get edited.
 * A catalogue is what Striver's sheet and NeetCode are too.
 *
 * Provenance:
 *   Brainstellar  101 puzzles, ids and titles read from brainstellar.com/puzzles
 *                 in August 2026. Difficulty is inferred from the site's own id
 *                 banding (1-99 easy, 100-199 medium, 200+ hard).
 *   LeetCode      Hand-picked from the lists that actually come up in campus
 *                 shortlists. Slugs are stable and form the URL directly.
 *   HackerRank    Linked at the track level; individual challenge slugs move.
 *   Codeforces    Linked as tag-filtered problemset queries rather than fixed
 *                 problem ids, so the link keeps working as the archive grows.
 *
 * Add rows freely. Nothing here is generated at build time, and the admin page
 * reads straight from this array.
 */

export type BankSource =
  | 'LeetCode'
  | 'Brainstellar'
  | 'HackerRank'
  | 'Codeforces'
  | 'GeeksforGeeks'

export type BankDifficulty = 'Easy' | 'Medium' | 'Hard'

export type BankItem = {
  id: string
  title: string
  source: BankSource
  url: string
  difficulty: BankDifficulty
  topics: string[]
  roles: RoleId[]
  /** Why this one earns a place, when that is not obvious from the title. */
  note?: string
}

export const BANK_SOURCES: BankSource[] = [
  'LeetCode',
  'Brainstellar',
  'HackerRank',
  'Codeforces',
  'GeeksforGeeks',
]

const lc = (
  slug: string,
  title: string,
  difficulty: BankDifficulty,
  topics: string[],
  roles: RoleId[] = ['sde'],
  note?: string,
): BankItem => ({
  id: `lc-${slug}`,
  title,
  source: 'LeetCode',
  url: `https://leetcode.com/problems/${slug}/`,
  difficulty,
  topics,
  roles,
  note,
})

export const QUESTION_BANK: BankItem[] = [
  // ------------------------------------------------- LeetCode: arrays & hashing
  lc('two-sum', 'Two Sum', 'Easy', ['Array', 'Hash map'], ['sde'], 'The warm-up almost every screen opens with.'),
  lc('contains-duplicate', 'Contains Duplicate', 'Easy', ['Array', 'Hash set']),
  lc('valid-anagram', 'Valid Anagram', 'Easy', ['String', 'Counting']),
  lc('group-anagrams', 'Group Anagrams', 'Medium', ['String', 'Hash map']),
  lc('top-k-frequent-elements', 'Top K Frequent Elements', 'Medium', ['Heap', 'Bucket sort']),
  lc('product-of-array-except-self', 'Product of Array Except Self', 'Medium', ['Array', 'Prefix'], ['sde'], 'The no-division constraint is the whole question.'),
  lc('longest-consecutive-sequence', 'Longest Consecutive Sequence', 'Medium', ['Hash set']),
  lc('encode-and-decode-strings', 'Encode and Decode Strings', 'Medium', ['String', 'Design']),
  lc('valid-sudoku', 'Valid Sudoku', 'Medium', ['Matrix', 'Hash set']),
  lc('merge-intervals', 'Merge Intervals', 'Medium', ['Sorting', 'Intervals']),
  lc('insert-interval', 'Insert Interval', 'Medium', ['Intervals']),
  lc('non-overlapping-intervals', 'Non-overlapping Intervals', 'Medium', ['Greedy', 'Intervals']),
  lc('meeting-rooms-ii', 'Meeting Rooms II', 'Medium', ['Heap', 'Intervals']),
  lc('maximum-subarray', 'Maximum Subarray', 'Medium', ['Kadane', 'DP']),
  lc('rotate-image', 'Rotate Image', 'Medium', ['Matrix']),
  lc('spiral-matrix', 'Spiral Matrix', 'Medium', ['Matrix']),
  lc('set-matrix-zeroes', 'Set Matrix Zeroes', 'Medium', ['Matrix', 'In-place']),

  // ------------------------------------------------- LeetCode: two pointers
  lc('valid-palindrome', 'Valid Palindrome', 'Easy', ['Two pointers', 'String']),
  lc('3sum', '3Sum', 'Medium', ['Two pointers', 'Sorting'], ['sde'], 'Duplicate handling is where most attempts fail.'),
  lc('container-with-most-water', 'Container With Most Water', 'Medium', ['Two pointers', 'Greedy']),
  lc('trapping-rain-water', 'Trapping Rain Water', 'Hard', ['Two pointers', 'Stack']),
  lc('two-sum-ii-input-array-is-sorted', 'Two Sum II', 'Medium', ['Two pointers']),

  // ------------------------------------------------- LeetCode: sliding window
  lc('best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'Easy', ['Sliding window'], ['sde', 'quant']),
  lc('longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'Medium', ['Sliding window']),
  lc('longest-repeating-character-replacement', 'Longest Repeating Character Replacement', 'Medium', ['Sliding window']),
  lc('permutation-in-string', 'Permutation in String', 'Medium', ['Sliding window']),
  lc('minimum-window-substring', 'Minimum Window Substring', 'Hard', ['Sliding window']),
  lc('sliding-window-maximum', 'Sliding Window Maximum', 'Hard', ['Deque', 'Monotonic']),

  // ------------------------------------------------- LeetCode: stack & design
  lc('valid-parentheses', 'Valid Parentheses', 'Easy', ['Stack']),
  lc('min-stack', 'Min Stack', 'Medium', ['Stack', 'Design']),
  lc('evaluate-reverse-polish-notation', 'Evaluate Reverse Polish Notation', 'Medium', ['Stack']),
  lc('daily-temperatures', 'Daily Temperatures', 'Medium', ['Monotonic stack']),
  lc('largest-rectangle-in-histogram', 'Largest Rectangle in Histogram', 'Hard', ['Monotonic stack']),
  lc('lru-cache', 'LRU Cache', 'Medium', ['Design', 'Hash map', 'Linked list'], ['sde'], 'Comes up constantly in Day 1 loops.'),
  lc('lfu-cache', 'LFU Cache', 'Hard', ['Design']),
  lc('implement-trie-prefix-tree', 'Implement Trie', 'Medium', ['Trie', 'Design']),
  lc('design-add-and-search-words-data-structure', 'Design Add and Search Words', 'Medium', ['Trie', 'Design']),

  // ------------------------------------------------- LeetCode: binary search
  lc('binary-search', 'Binary Search', 'Easy', ['Binary search']),
  lc('search-in-rotated-sorted-array', 'Search in Rotated Sorted Array', 'Medium', ['Binary search']),
  lc('find-minimum-in-rotated-sorted-array', 'Find Minimum in Rotated Sorted Array', 'Medium', ['Binary search']),
  lc('koko-eating-bananas', 'Koko Eating Bananas', 'Medium', ['Binary search on answer']),
  lc('median-of-two-sorted-arrays', 'Median of Two Sorted Arrays', 'Hard', ['Binary search']),
  lc('search-a-2d-matrix', 'Search a 2D Matrix', 'Medium', ['Binary search', 'Matrix']),

  // ------------------------------------------------- LeetCode: linked list
  lc('reverse-linked-list', 'Reverse Linked List', 'Easy', ['Linked list']),
  lc('merge-two-sorted-lists', 'Merge Two Sorted Lists', 'Easy', ['Linked list']),
  lc('linked-list-cycle', 'Linked List Cycle', 'Easy', ['Floyd', 'Two pointers']),
  lc('reorder-list', 'Reorder List', 'Medium', ['Linked list']),
  lc('remove-nth-node-from-end-of-list', 'Remove Nth Node From End of List', 'Medium', ['Two pointers']),
  lc('copy-list-with-random-pointer', 'Copy List with Random Pointer', 'Medium', ['Hash map', 'Linked list']),
  lc('merge-k-sorted-lists', 'Merge k Sorted Lists', 'Hard', ['Heap', 'Divide and conquer']),

  // ------------------------------------------------- LeetCode: trees & graphs
  lc('invert-binary-tree', 'Invert Binary Tree', 'Easy', ['Tree', 'DFS']),
  lc('maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree', 'Easy', ['Tree', 'DFS']),
  lc('diameter-of-binary-tree', 'Diameter of Binary Tree', 'Easy', ['Tree', 'DFS']),
  lc('balanced-binary-tree', 'Balanced Binary Tree', 'Easy', ['Tree']),
  lc('same-tree', 'Same Tree', 'Easy', ['Tree']),
  lc('lowest-common-ancestor-of-a-binary-search-tree', 'Lowest Common Ancestor of a BST', 'Medium', ['BST']),
  lc('binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal', 'Medium', ['BFS']),
  lc('validate-binary-search-tree', 'Validate Binary Search Tree', 'Medium', ['BST', 'DFS']),
  lc('kth-smallest-element-in-a-bst', 'Kth Smallest Element in a BST', 'Medium', ['BST', 'Inorder']),
  lc('construct-binary-tree-from-preorder-and-inorder-traversal', 'Build Tree from Preorder and Inorder', 'Medium', ['Tree', 'Recursion']),
  lc('binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum', 'Hard', ['Tree', 'DFS']),
  lc('serialize-and-deserialize-binary-tree', 'Serialize and Deserialize Binary Tree', 'Hard', ['Tree', 'Design']),
  lc('number-of-islands', 'Number of Islands', 'Medium', ['Graph', 'DFS', 'BFS']),
  lc('clone-graph', 'Clone Graph', 'Medium', ['Graph', 'Hash map']),
  lc('course-schedule', 'Course Schedule', 'Medium', ['Topological sort'], ['sde'], 'Cycle detection dressed as a scheduling problem.'),
  lc('pacific-atlantic-water-flow', 'Pacific Atlantic Water Flow', 'Medium', ['Graph', 'DFS']),
  lc('rotting-oranges', 'Rotting Oranges', 'Medium', ['BFS', 'Multi-source']),
  lc('word-ladder', 'Word Ladder', 'Hard', ['BFS']),
  lc('alien-dictionary', 'Alien Dictionary', 'Hard', ['Topological sort']),

  // ------------------------------------------------- LeetCode: dynamic programming
  lc('climbing-stairs', 'Climbing Stairs', 'Easy', ['DP']),
  lc('house-robber', 'House Robber', 'Medium', ['DP']),
  lc('house-robber-ii', 'House Robber II', 'Medium', ['DP']),
  lc('coin-change', 'Coin Change', 'Medium', ['DP', 'Unbounded knapsack']),
  lc('longest-increasing-subsequence', 'Longest Increasing Subsequence', 'Medium', ['DP', 'Binary search']),
  lc('word-break', 'Word Break', 'Medium', ['DP', 'String']),
  lc('combination-sum', 'Combination Sum', 'Medium', ['Backtracking']),
  lc('subsets', 'Subsets', 'Medium', ['Backtracking']),
  lc('permutations', 'Permutations', 'Medium', ['Backtracking']),
  lc('word-search', 'Word Search', 'Medium', ['Backtracking', 'Matrix']),
  lc('n-queens', 'N-Queens', 'Hard', ['Backtracking']),
  lc('longest-common-subsequence', 'Longest Common Subsequence', 'Medium', ['DP', '2D']),
  lc('edit-distance', 'Edit Distance', 'Medium', ['DP', '2D']),
  lc('partition-equal-subset-sum', 'Partition Equal Subset Sum', 'Medium', ['DP', 'Knapsack']),
  lc('unique-paths', 'Unique Paths', 'Medium', ['DP', 'Combinatorics'], ['sde', 'quant']),
  lc('longest-palindromic-substring', 'Longest Palindromic Substring', 'Medium', ['DP', 'String']),
  lc('regular-expression-matching', 'Regular Expression Matching', 'Hard', ['DP', 'String']),

  // ------------------------------------------------- LeetCode: heap, greedy, misc
  lc('kth-largest-element-in-an-array', 'Kth Largest Element in an Array', 'Medium', ['Heap', 'Quickselect']),
  lc('find-median-from-data-stream', 'Find Median from Data Stream', 'Hard', ['Two heaps', 'Design'], ['sde', 'quant']),
  lc('task-scheduler', 'Task Scheduler', 'Medium', ['Greedy', 'Heap']),
  lc('jump-game', 'Jump Game', 'Medium', ['Greedy']),
  lc('gas-station', 'Gas Station', 'Medium', ['Greedy']),
  lc('number-of-1-bits', 'Number of 1 Bits', 'Easy', ['Bit manipulation']),
  lc('counting-bits', 'Counting Bits', 'Easy', ['Bit manipulation', 'DP']),
  lc('missing-number', 'Missing Number', 'Easy', ['Bit manipulation', 'Maths']),
  lc('single-number', 'Single Number', 'Easy', ['XOR']),

  // ------------------------------------------------- SQL, for data roles
  lc('combine-two-tables', 'Combine Two Tables', 'Easy', ['SQL', 'Joins'], ['aiml', 'sde']),
  lc('second-highest-salary', 'Second Highest Salary', 'Medium', ['SQL'], ['aiml', 'sde']),
  lc('department-highest-salary', 'Department Highest Salary', 'Medium', ['SQL', 'Window'], ['aiml']),
  lc('rank-scores', 'Rank Scores', 'Medium', ['SQL', 'Window'], ['aiml'], 'Window functions come up in every data screen.'),
  lc('consecutive-numbers', 'Consecutive Numbers', 'Medium', ['SQL', 'Window'], ['aiml']),

  // ------------------------------------------------- HackerRank tracks
  { id: 'hr-prep-kit', title: 'Interview Preparation Kit', source: 'HackerRank', url: 'https://www.hackerrank.com/interview/interview-preparation-kit', difficulty: 'Medium', topics: ['Mixed'], roles: ['sde'], note: 'HackerRank’s own curated interview track. Good for timed practice, since most campus OAs run on HackerRank.' },
  { id: 'hr-algorithms', title: 'Algorithms track', source: 'HackerRank', url: 'https://www.hackerrank.com/domains/algorithms', difficulty: 'Medium', topics: ['Algorithms'], roles: ['sde'] },
  { id: 'hr-datastructures', title: 'Data Structures track', source: 'HackerRank', url: 'https://www.hackerrank.com/domains/data-structures', difficulty: 'Medium', topics: ['Data structures'], roles: ['sde'] },
  { id: 'hr-sql', title: 'SQL track', source: 'HackerRank', url: 'https://www.hackerrank.com/domains/sql', difficulty: 'Medium', topics: ['SQL'], roles: ['aiml', 'sde'] },
  { id: 'hr-python', title: 'Python track', source: 'HackerRank', url: 'https://www.hackerrank.com/domains/python', difficulty: 'Easy', topics: ['Python'], roles: ['aiml'] },
  { id: 'hr-mathematics', title: 'Mathematics track', source: 'HackerRank', url: 'https://www.hackerrank.com/domains/mathematics', difficulty: 'Hard', topics: ['Probability', 'Combinatorics'], roles: ['quant'] },

  // ------------------------------------------------- Codeforces, by tag
  { id: 'cf-800', title: 'Rated 800 to 1100 warm-ups', source: 'Codeforces', url: 'https://codeforces.com/problemset?tags=800-1100', difficulty: 'Easy', topics: ['Implementation'], roles: ['sde', 'quant'], note: 'Start here if contests still feel fast.' },
  { id: 'cf-dp', title: 'Dynamic programming set', source: 'Codeforces', url: 'https://codeforces.com/problemset?tags=dp', difficulty: 'Medium', topics: ['DP'], roles: ['sde'] },
  { id: 'cf-greedy', title: 'Greedy set', source: 'Codeforces', url: 'https://codeforces.com/problemset?tags=greedy', difficulty: 'Medium', topics: ['Greedy'], roles: ['sde'] },
  { id: 'cf-graphs', title: 'Graph set', source: 'Codeforces', url: 'https://codeforces.com/problemset?tags=graphs', difficulty: 'Hard', topics: ['Graphs'], roles: ['sde'] },
  { id: 'cf-probability', title: 'Probability set', source: 'Codeforces', url: 'https://codeforces.com/problemset?tags=probabilities', difficulty: 'Hard', topics: ['Probability'], roles: ['quant'] },
  { id: 'cf-math', title: 'Maths set', source: 'Codeforces', url: 'https://codeforces.com/problemset?tags=math', difficulty: 'Medium', topics: ['Maths'], roles: ['quant', 'sde'] },

  // ------------------------------------------------- GeeksforGeeks, CS fundamentals
  { id: 'gfg-os', title: 'Operating Systems for interviews', source: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/last-minute-notes-operating-systems/', difficulty: 'Medium', topics: ['OS'], roles: ['sde'] },
  { id: 'gfg-dbms', title: 'DBMS for interviews', source: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/last-minute-notes-dbms/', difficulty: 'Medium', topics: ['DBMS'], roles: ['sde', 'aiml'] },
  { id: 'gfg-cn', title: 'Computer Networks for interviews', source: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/last-minute-notes-computer-network/', difficulty: 'Medium', topics: ['Networks'], roles: ['sde'] },
  { id: 'gfg-aptitude', title: 'Aptitude question sets', source: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/aptitude-questions-and-answers/', difficulty: 'Easy', topics: ['Aptitude'], roles: ['fmcg', 'finance', 'consult'] },
  { id: 'gfg-puzzles', title: 'Interview puzzles', source: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/puzzles/', difficulty: 'Medium', topics: ['Puzzles'], roles: ['quant', 'consult'] },

  // ------------------------------------------------- Brainstellar (verified list)
  { id: 'bs-1', title: 'Rolling the bullet', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-2', title: 'Pirates & The Treasure', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/2', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-3', title: 'The Returning Explorer', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/3', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-4', title: 'Which Switch?', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/4', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-5', title: 'Lucky Candy', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/5', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-6', title: 'All Girls World?', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/6', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-7', title: 'Tigers & The Sheep', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/7', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-8', title: 'Duck & Fox', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/8', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-9', title: 'The Plane in the Wind', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/9', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-10', title: 'Burning Cords', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/10', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-11', title: 'Pair of Socks', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/11', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-12', title: 'Antipodal points', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/12', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-13', title: 'Half Time', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/13', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-14', title: 'Monty Hall Problem', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/14', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-15', title: 'Prisoner\'s Hat', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/15', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-16', title: 'Knight and Knave', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/16', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-17', title: 'Water & Wine', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/17', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-18', title: '100 Light bulbs', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/18', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-19', title: 'UnBiased coin', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/19', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-20', title: 'You have a train to catch!', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/20', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-21', title: '2 Eggs', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/21', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-22', title: 'e^Pi or Pi^e', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/22', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-23', title: 'Shooting in Circle', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/23', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-24', title: 'Invisible Dice', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/24', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-25', title: 'Daughter or Son', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/25', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-26', title: 'Dark Room Deck', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/26', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-27', title: 'Cheating Husbands', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/27', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-28', title: 'Father of lies', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/28', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-29', title: 'Devil\'s Penny', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/29', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-30', title: 'Witches at the coffee shop', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/30', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-31', title: 'Poisonous wine', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/31', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-32', title: 'Half Heads', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/32', difficulty: 'Easy', topics: ["Warm-up"], roles: ['quant'] },
  { id: 'bs-101', title: 'Drunk Passenger', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/101', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-102', title: 'Stick to Triangle', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/102', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-103', title: 'Rabbit on the Staircase', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/103', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-104', title: 'Sharing Wood', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/104', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-105', title: 'Infinity & Beyond', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/105', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-106', title: 'Chuck a Luck', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/106', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-107', title: 'MULTILINGUAL', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/107', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-108', title: 'Guess the Toss', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/108', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-109', title: 'Pattern on Snowflakes', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/109', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-110', title: 'King\'s Salary', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/110', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-111', title: 'Counting on friends', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/111', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-112', title: 'Random Ratio', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/112', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-114', title: 'Second Chance', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/114', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-115', title: 'Innocent Monkey', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/115', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-116', title: 'Consecutive Heads', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/116', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-117', title: 'Chess Tournament', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/117', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-118', title: 'Number of Double Heads', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/118', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-119', title: 'Breaking Stick', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/119', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-120', title: 'Prisoner\'s Hat (multicolor)', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/120', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-121', title: 'Rainbow Hats', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/121', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-122', title: '2 Equations & 3 Unknowns', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/122', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-123', title: 'Domino Covering', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/123', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-124', title: 'Fruit Magic', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/124', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-125', title: 'Catching Ants', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/125', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-126', title: 'Color Complex', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/126', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-127', title: 'Light Bulbs in circle', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/127', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-128', title: 'Chocolate Bar', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/128', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-129', title: 'Dead Men Walking', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/129', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-130', title: 'Square Infection', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/130', difficulty: 'Medium', topics: ["Probability"], roles: ['quant'] },
  { id: 'bs-201', title: 'Colored Runs of Cards', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/201', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-202', title: 'Drunk Ant', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/202', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-203', title: 'Distance from North Pole', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/203', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-204', title: 'Expected Breakup Length', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/204', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-205', title: 'Messing with Envelops', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/205', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-206', title: 'Collecting Lucky coupons', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/206', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-207', title: 'The Noodles', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/207', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-208', title: 'Distinct Number Draws', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/208', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-209', title: 'Greed for an ACE', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/209', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-210', title: 'Random point on disk', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/210', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-211', title: 'Enclosing The Center', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/211', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-213', title: 'Sum To One', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/213', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-215', title: 'Random Walk', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/215', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-216', title: 'Left Some Candies', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/216', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-217', title: 'Catching the Submarine', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/217', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-218', title: 'Catching the Spy', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/218', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-220', title: 'Pure Gold', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/220', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-221', title: 'Game of Divisors', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/221', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-222', title: 'Counter Strike', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/222', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-223', title: 'Sharing a Secret', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/223', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-224', title: 'Weights Reckoning', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/224', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-225', title: 'Gas Stations on Circular Trek', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/225', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-226', title: 'Bricking Box', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/226', difficulty: 'Hard', topics: ["Expected value"], roles: ['quant'] },
  { id: 'bs-1002', title: 'To Begin or Not to begin?', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1002', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1003', title: 'Crazy Postman', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1003', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1004', title: 'Single Bid', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1004', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1005', title: 'Waiting for a Truck', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1005', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1006', title: 'The Blind Archer', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1006', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1008', title: 'Bullets of Fate', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1008', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1009', title: 'Clan Size', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1009', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1011', title: 'Min & Max', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1011', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1012', title: 'Prisoner\'s Hat (Infinity)', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1012', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1013', title: 'Crazy Clock', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1013', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1014', title: 'Candy Game', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1014', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1015', title: 'Overlapping Coins', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1015', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1016', title: 'Scaling a Square', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1016', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1017', title: 'Consecutive sums', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1017', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1018', title: 'Intersecting Pillars', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1018', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1019', title: 'Weird Sequences', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1019', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },
  { id: 'bs-1020', title: 'Color Switches', source: 'Brainstellar', url: 'https://brainstellar.com/puzzles/1020', difficulty: 'Hard', topics: ["Advanced"], roles: ['quant'] },]

/** Every topic present in the bank, for the filter rail. */
export const BANK_TOPICS: string[] = [
  ...new Set(QUESTION_BANK.flatMap((q) => q.topics)),
].sort()
