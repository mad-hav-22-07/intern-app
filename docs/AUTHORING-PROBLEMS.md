# Authoring a solvable problem

Everything in `src/data/problems/` is a problem a student can open in the editor,
run against examples, and submit against hidden tests. This is the contract for
adding more.

## The one rule

**Write the statement yourself. Never copy one.**

LeetCode, Codeforces and HackerRank own the text of their problems. We link to
them (`questionBank.ts` is a catalogue of ~220 such links) but we do not
reproduce them. Every problem here is *modelled on* a well-known one — same
underlying idea, same difficulty — and states it in `origin` so a student can go
read the original's editorial afterwards.

That means: new wording, new variable names, new examples, new framing where it
helps. "Two Sum" becomes "Pair Sum" with the placement cell's interview room, or
whatever fits. If you find yourself reaching for the original's phrasing, you are
doing it wrong.

## Where things go

| What | Where |
|---|---|
| The problems | `src/data/problems/<group>.ts`, exporting `<GROUP>_PROBLEMS: CodingProblem[]` |
| Registered in | `src/data/problems/index.ts` — add to `ALL_PROBLEMS` |
| Reference solutions | `scripts/solutions/<group>.ts`, exporting `<GROUP>_SOLUTIONS` |
| Registered in | `scripts/solutions/index.ts` |

`scripts/` is never imported by `src/`, so reference solutions do not reach the
bundle and cannot be read out of the page source.

## The shape

```ts
import type { CodingProblem } from '../problemTypes'

const example: CodingProblem = {
  id: 'cp-<kebab-case>',          // globally unique, never renumber
  title: 'Pair Sum',
  difficulty: 'Easy',             // 'Easy' | 'Medium' | 'Hard'
  topics: ['Array', 'Hash map'],
  roles: ['sde'],                 // 'sde' | 'quant' | ...

  // Paragraphs. `backticks` render as inline code; nothing else is parsed.
  // Say what to return, say what to return when there is no answer, and give
  // the student the one sentence that tells them the naive approach is too slow.
  statement: [...],

  constraints: ['1 <= nums.length <= 200000', ...],

  signature: {
    name: 'twoSum',               // lowerCamelCase, this is what the judge calls
    params: [
      { name: 'nums', type: 'int[]' },
      { name: 'target', type: 'int' },
    ],
    returns: 'int[]',
  },

  // JSON values. `args` matches `params` in order.
  cases: [
    { args: [[2, 7, 11, 15], 9], expected: [0, 1], note: 'Explanation shown under the example.' },
    { args: [[1, 2, 3, 9], 6], expected: [] },
    { args: [[-1, -2, -3, -4, -5], -9], expected: [3, 4], hidden: true },
    ...
  ],

  starter: { python: '...', cpp: '...', java: '...', javascript: '...' },

  origin: { source: 'LeetCode', title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/' },

  hints: ['The nudge.', 'The one that gives it away.'],
}
```

### Types available

`int`, `double`, `boolean`, `string`, `int[]`, `string[]`, `int[][]`.

Adding a type means adding a reader and a formatter to **all four** drivers in
`src/lib/harness.ts`. Do not add one casually; reshape the problem first.

### Cases

- **At least 2 visible** examples and **at least 3 hidden**. Eight total is the
  house style.
- The visible ones are teaching material: pick the ones that explain the problem.
- The hidden ones are where the bugs live. Include, where they apply: the
  smallest legal input, an empty answer, duplicates, negatives, all-equal
  elements, and the case that breaks the plausible-but-wrong greedy.
- The answer must be **unique**. If two different return values are both correct,
  the problem is broken — tighten the statement (`return the smallest`, `in
  increasing order`) until it is not.

### Starters

Four languages, LeetCode-shaped, with a placeholder body that **compiles and runs
but returns the wrong answer**:

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # your code here
        return []
```

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // your code here
        return {};
    }
};
```

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        // your code here
        return new int[0];
    }
}
```

```js
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
  // your code here
  return []
}
```

Notes that will bite you:

- **C++**: `#include <bits/stdc++.h>` and `using namespace std;` are added for
  you, above your class. Array parameters are `vector<int>&` — non-const, so the
  driver passes an lvalue and you may sort in place.
- **Java**: your class must be `class Solution`, not `public class Solution` —
  the driver's `Main` is the public one. `java.util.*` and `java.io.*` are
  imported for you.
- **Python**: `from typing import List` yourself if you annotate with it. The
  driver instantiates `Solution()` once and calls the method per case.
- **JavaScript**: a top-level `var name = function (...)`. It shares scope with
  the driver, which calls it by name.
- A placeholder that happens to be correct fails verification, on purpose — a
  problem whose starter already passes is worthless.

### Reference solutions

The same four languages, actually correct, in `scripts/solutions/<group>.ts`.
These are what prove your expected values are right: four independent
implementations agreeing is very hard to get wrong by accident.

## Verify before you claim it works

```bash
npm run verify:problems -- --local      # JavaScript only, no network, fast
npm run verify:problems -- <id-or-word> # one problem, all four languages
npm run verify:problems                 # everything (needs the network)
```

It checks that every starter compiles, that no starter passes everything, that
every reference solution passes everything, and that all four languages produce
the identical canonical output for every case.

**A problem that has not gone green in all four languages is not finished.** A
wrong expected value is the one bug a student cannot debug their way past, and
they will assume the fault is theirs.
