/**
 * SQL problems: the same "write a real thing, a real judge checks it" idea as
 * `data/coding.ts`, but for SQL instead of a method call.
 *
 * There is no signature to call here — the student writes a query against a
 * schema they can see, and the judge runs `schema + seed + their query` as one
 * script on Judge0's SQLite (language id 82, SQLite 3.27.2) and diffs the rows
 * it prints against a known-good answer. See `lib/sqlJudge.ts` for exactly how.
 *
 * Two things every problem here gets right on purpose:
 *
 * **Row order never matters.** SQLite makes no promise about row order without
 * an explicit `ORDER BY`, and different query plans for the same logical query
 * can come back in different orders. The judge sorts both the student's rows
 * and the known-good rows before comparing, so a correct query is never marked
 * wrong for the order it happened to return. See `lib/sqlJudge.ts` for where
 * that sort happens — it is the one invariant worth preserving if this file
 * grows a seventh problem.
 *
 * **A hidden seed catches a hardcoded answer.** `SELECT 'Ananya', 9.1` would
 * pass a check against `expected` alone. On submit the judge re-runs the query
 * against `schema + seed + hiddenSeed` and requires it to also match
 * `hiddenExpected` — extra rows the student never saw. Every statement below
 * says so, so it is a documented rule, not a gotcha.
 */

export type SqlProblem = {
  /** `sq-<kebab>` — also the localStorage key for "solved". Never renumber. */
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topics: string[]
  /** Paragraphs. `backticks` render as inline code; nothing else is parsed. */
  statement: string[]
  /** `CREATE TABLE ...;` — shown to the student verbatim. */
  schema: string
  /** `INSERT ...;` — shown to the student verbatim. */
  seed: string
  /** Extra rows used only on submit, to catch a query that hardcodes the answer. */
  hiddenSeed?: string
  /** The right answer against `schema + seed`. */
  expected: { columns: string[]; rows: string[][] }
  /** The right answer against `schema + seed + hiddenSeed`. */
  hiddenExpected?: { columns: string[]; rows: string[][] }
  /** A query that runs cleanly but is wrong — what the editor opens with. */
  starter: string
  origin?: { source: string; title: string; url: string }
  /** Revealed one at a time, and only if asked for. */
  hints: string[]
}

const HIDDEN_NOTE =
  'Submitting runs your query twice: once against the rows shown above, and again after a second, hidden batch of rows is inserted. Both runs have to match — that second batch is what stops a query that just hardcodes the answer it can see.'

/* --------------------------------------------------------------------- sq-1 */

const shortlistedCompanies: SqlProblem = {
  id: 'sq-shortlisted-companies',
  title: 'Shortlisted Companies',
  difficulty: 'Easy',
  topics: ['Joins'],
  statement: [
    'The placement cell keeps `students` and, separately, `shortlists` — one row per student per company that has shortlisted them for an interview.',
    'Return the name of every shortlisted student together with the company that shortlisted them, one row per (student, company) pair. A student shortlisted by two companies appears twice, once per company.',
    'Row order does not matter — the judge compares the set of rows you return, not the order they arrive in.',
    HIDDEN_NOTE,
  ],
  schema: `CREATE TABLE students(id INTEGER, name TEXT, branch TEXT, cgpa REAL);
CREATE TABLE shortlists(student_id INTEGER, company TEXT, role TEXT);`,
  seed: `INSERT INTO students VALUES
  (1,'Ananya','CSE',9.1),
  (2,'Bilal','ECE',8.4),
  (3,'Chitra','CSE',7.9),
  (4,'Devan','MECH',8.8);
INSERT INTO shortlists VALUES
  (1,'Athena Systems','SDE'),
  (2,'Vertex Robotics','Analog Design'),
  (4,'Athena Systems','Hardware');`,
  hiddenSeed: `INSERT INTO students VALUES (5,'Esha','CSE',8.0);
INSERT INTO shortlists VALUES (5,'Nimbus Cloud','SDE'), (3,'Athena Systems','SDE');`,
  expected: {
    columns: ['name', 'company'],
    rows: [
      ['Ananya', 'Athena Systems'],
      ['Bilal', 'Vertex Robotics'],
      ['Devan', 'Athena Systems'],
    ],
  },
  hiddenExpected: {
    columns: ['name', 'company'],
    rows: [
      ['Ananya', 'Athena Systems'],
      ['Bilal', 'Vertex Robotics'],
      ['Chitra', 'Athena Systems'],
      ['Devan', 'Athena Systems'],
      ['Esha', 'Nimbus Cloud'],
    ],
  },
  starter: `SELECT name FROM students;`,
  origin: {
    source: 'LeetCode',
    title: 'Combine Two Tables',
    url: 'https://leetcode.com/problems/combine-two-tables/',
  },
  hints: [
    'A student with no row in `shortlists` should not appear at all — that is exactly what an inner `JOIN` gives you for free.',
    '`JOIN shortlists sl ON sl.student_id = students.id`, then select the two columns you actually need.',
  ],
}

/* --------------------------------------------------------------------- sq-2 */

const popularBranches: SqlProblem = {
  id: 'sq-popular-branches',
  title: 'Popular Branches',
  difficulty: 'Easy',
  topics: ['Aggregation', 'Group by', 'Having'],
  statement: [
    '`students` has one row per student; `offers` has one row per offer made, pointing back at `students.id`.',
    'Return every branch that has received **more than one** offer in total, along with how many. A branch with zero or one offer should not appear.',
    'This needs a filter on the *grouped* count, which is what `HAVING` is for — `WHERE` only sees one row at a time, before the grouping happens.',
    HIDDEN_NOTE,
  ],
  schema: `CREATE TABLE students(id INTEGER, name TEXT, branch TEXT, cgpa REAL);
CREATE TABLE offers(id INTEGER, student_id INTEGER, company TEXT, package_lpa REAL);`,
  seed: `INSERT INTO students VALUES
 (1,'Ananya','CSE',9.1),
 (2,'Bilal','ECE',8.4),
 (3,'Chitra','CSE',7.9),
 (4,'Devan','MECH',8.8),
 (5,'Esha','ECE',8.0),
 (6,'Farhan','CSE',9.3);
INSERT INTO offers VALUES
 (1,1,'Athena Systems',24.0),
 (2,3,'Vertex Robotics',18.5),
 (3,2,'Nimbus Cloud',21.0),
 (4,5,'Quanta Systems',19.0),
 (5,6,'Falcon Analytics',22.0);`,
  hiddenSeed: `INSERT INTO students VALUES (7,'Gita','MECH',7.5);
INSERT INTO offers VALUES (6,4,'Orion Devices',15.0), (7,7,'Titan Robotics',16.0);`,
  expected: {
    columns: ['branch', 'offers'],
    rows: [
      ['CSE', '3'],
      ['ECE', '2'],
    ],
  },
  hiddenExpected: {
    columns: ['branch', 'offers'],
    rows: [
      ['CSE', '3'],
      ['ECE', '2'],
      ['MECH', '2'],
    ],
  },
  starter: `SELECT branch, COUNT(*) FROM students GROUP BY branch;`,
  origin: {
    source: 'LeetCode',
    title: 'Big Countries / grouped-count pattern',
    url: 'https://leetcode.com/problems/classes-more-than-5-students/',
  },
  hints: [
    'Join `offers` to `students` first so each offer carries its branch, then `GROUP BY branch`.',
    '`HAVING COUNT(*) > 1` goes after the `GROUP BY`, not in a `WHERE` — the count does not exist yet at the row level `WHERE` operates on.',
  ],
}

/* --------------------------------------------------------------------- sq-3 */

const studentsWithoutOffers: SqlProblem = {
  id: 'sq-students-without-offers',
  title: 'Students Without Offers',
  difficulty: 'Medium',
  topics: ['Joins', 'NULL handling'],
  statement: [
    '`students` and `offers` are the same pair as before — one row per offer, pointing at `students.id`. A student with no offer simply has no row in `offers` at all.',
    'Return the name of every student who has **not** received any offer.',
    'An inner join only keeps rows that match on both sides, so it can never produce "the rows that had no match." A `LEFT JOIN` keeps every student regardless, filling the offer columns with `NULL` when there is nothing to match — which is exactly what lets you ask for the ones where that happened, with `IS NULL`.',
    HIDDEN_NOTE,
  ],
  schema: `CREATE TABLE students(id INTEGER, name TEXT, branch TEXT);
CREATE TABLE offers(id INTEGER, student_id INTEGER, company TEXT);`,
  seed: `INSERT INTO students VALUES (1,'Ananya','CSE'), (2,'Bilal','ECE'), (3,'Chitra','CSE'), (4,'Devan','MECH');
INSERT INTO offers VALUES (1,1,'Athena Systems'), (2,3,'Vertex Robotics');`,
  hiddenSeed: `INSERT INTO students VALUES (5,'Esha','ECE');
INSERT INTO offers VALUES (3,4,'Nimbus Cloud');`,
  expected: {
    columns: ['name'],
    rows: [['Bilal'], ['Devan']],
  },
  hiddenExpected: {
    columns: ['name'],
    rows: [['Bilal'], ['Esha']],
  },
  starter: `SELECT name FROM students;`,
  origin: {
    source: 'LeetCode',
    title: 'Customers Who Never Order',
    url: 'https://leetcode.com/problems/customers-who-never-order/',
  },
  hints: [
    '`SELECT s.name FROM students s LEFT JOIN offers o ON o.student_id = s.id` keeps every student, with `o.*` all `NULL` when nothing matched.',
    'Add `WHERE o.id IS NULL` — never compare a `NULL` with `= `, it is neither true nor false, it is unknown, and `WHERE` throws unknown rows away same as false.',
  ],
}

/* --------------------------------------------------------------------- sq-4 */

const aboveAverageCgpa: SqlProblem = {
  id: 'sq-above-average-cgpa',
  title: 'Above Average CGPA',
  difficulty: 'Medium',
  topics: ['Subqueries', 'Aggregation'],
  statement: [
    '`students` holds every registered student and their `cgpa`.',
    'Return the name and CGPA of every student whose CGPA is strictly greater than the **average CGPA across all students** — not some fixed cutoff, the actual average of whatever rows happen to be in the table.',
    'That average has to be computed once, over the whole table, independently of the row being filtered — a job for a subquery in the `WHERE` clause, not a `GROUP BY`.',
    HIDDEN_NOTE,
  ],
  schema: `CREATE TABLE students(id INTEGER, name TEXT, branch TEXT, cgpa REAL);`,
  seed: `INSERT INTO students VALUES
 (1,'Ananya','CSE',9.1),
 (2,'Bilal','ECE',8.4),
 (3,'Chitra','CSE',7.9),
 (4,'Devan','MECH',8.8),
 (5,'Esha','ECE',7.5);`,
  hiddenSeed: `INSERT INTO students VALUES (6,'Farhan','CSE',9.5), (7,'Gita','MECH',6.0);`,
  expected: {
    columns: ['name', 'cgpa'],
    rows: [
      ['Ananya', '9.1'],
      ['Bilal', '8.4'],
      ['Devan', '8.8'],
    ],
  },
  hiddenExpected: {
    columns: ['name', 'cgpa'],
    rows: [
      ['Ananya', '9.1'],
      ['Bilal', '8.4'],
      ['Devan', '8.8'],
      ['Farhan', '9.5'],
    ],
  },
  starter: `SELECT name, cgpa FROM students;`,
  origin: {
    source: 'HackerRank',
    title: 'Weather Observation Station-style subquery filters',
    url: 'https://www.hackerrank.com/domains/sql',
  },
  hints: [
    '`(SELECT AVG(cgpa) FROM students)` is a single number — you can drop it straight into a `WHERE cgpa > (...)`.',
    'Adding a new row to the table changes the average, which changes who qualifies — that is exactly why the hidden batch here does not just add more of the same answer.',
  ],
}

/* --------------------------------------------------------------------- sq-5 */

const sameCompanyBatchmates: SqlProblem = {
  id: 'sq-same-company-batchmates',
  title: 'Same-Company Batchmates',
  difficulty: 'Medium',
  topics: ['Self-joins'],
  statement: [
    '`offers` has one row per student who has an offer: `student_id`, `name`, `company`.',
    'Return every pair of *different* students who hold an offer from the **same** company, one row per pair: the alphabetically-earlier name, the alphabetically-later name, and the company. A company with only one offer contributes no pairs, and a pair must not be listed twice in reverse.',
    'There is only one table here, so "pair two rows of the same table up with each other" means joining `offers` to itself — the self-join. Comparing `a.name < b.name` in the join condition, instead of `!=`, is what gets you each unordered pair exactly once, with the names already in a fixed order.',
    HIDDEN_NOTE,
  ],
  schema: `CREATE TABLE offers(student_id INTEGER, name TEXT, company TEXT);`,
  seed: `INSERT INTO offers VALUES
 (1,'Ananya','Athena Systems'),
 (2,'Bilal','Athena Systems'),
 (3,'Chitra','Vertex Robotics'),
 (4,'Devan','Nimbus Cloud'),
 (5,'Esha','Vertex Robotics');`,
  hiddenSeed: `INSERT INTO offers VALUES (6,'Farhan','Athena Systems'), (7,'Gita','Vertex Robotics');`,
  expected: {
    columns: ['name_a', 'name_b', 'company'],
    rows: [
      ['Ananya', 'Bilal', 'Athena Systems'],
      ['Chitra', 'Esha', 'Vertex Robotics'],
    ],
  },
  hiddenExpected: {
    columns: ['name_a', 'name_b', 'company'],
    rows: [
      ['Ananya', 'Bilal', 'Athena Systems'],
      ['Ananya', 'Farhan', 'Athena Systems'],
      ['Bilal', 'Farhan', 'Athena Systems'],
      ['Chitra', 'Esha', 'Vertex Robotics'],
      ['Chitra', 'Gita', 'Vertex Robotics'],
      ['Esha', 'Gita', 'Vertex Robotics'],
    ],
  },
  starter: `SELECT name, company FROM offers;`,
  origin: {
    source: 'LeetCode',
    title: 'Rising Temperature-style self-join over one table',
    url: 'https://leetcode.com/problems/rising-temperature/',
  },
  hints: [
    '`FROM offers a JOIN offers b ON a.company = b.company` pairs every offer with every offer at the same company, including itself with itself — you need one more condition to fix that.',
    '`AND a.name < b.name` throws out `a` paired with itself (names are never `<` themselves) and keeps only one direction of every pair, instead of both `(Ananya, Bilal)` and `(Bilal, Ananya)`.',
  ],
}

/* --------------------------------------------------------------------- sq-6 */

const rankByPackage: SqlProblem = {
  id: 'sq-rank-by-package',
  title: 'Top Package per Branch',
  difficulty: 'Hard',
  topics: ['Window functions', 'CTEs', 'Ranking'],
  statement: [
    '`students` has one row per student; `offers` has one row per student who has an offer, with `package_lpa`.',
    'Within each branch, rank its students by package — highest first. Two students on the same package **share** the same rank, and the rank right after a tie skips ahead by the size of the tie (this is the standard `RANK()` rule, not `DENSE_RANK()`).',
    'Return the name, branch and package of every student who ranks **1** in their own branch. Two rank-1 finishes in the same branch is possible and correct when they are tied on package.',
    'This is naturally a window function: `RANK() OVER (PARTITION BY branch ORDER BY package_lpa DESC)` computes the rank per branch in one pass, without a self-join or a correlated subquery. Wrap it in a CTE (or a subquery) so you can then filter on the computed rank — a window function cannot be used directly inside `WHERE`.',
    HIDDEN_NOTE,
  ],
  schema: `CREATE TABLE students(id INTEGER, name TEXT, branch TEXT);
CREATE TABLE offers(student_id INTEGER, company TEXT, package_lpa REAL);`,
  seed: `INSERT INTO students VALUES
 (1,'Ananya','CSE'),(2,'Bilal','ECE'),(3,'Chitra','CSE'),(4,'Devan','MECH'),(5,'Esha','ECE'),(6,'Farhan','CSE');
INSERT INTO offers VALUES
 (1,'Athena Systems',24.0),
 (2,'Nimbus Cloud',21.0),
 (3,'Vertex Robotics',18.5),
 (4,'Falcon Analytics',15.0),
 (5,'Quanta Systems',19.0),
 (6,'Athena Systems',24.0);`,
  hiddenSeed: `INSERT INTO students VALUES (7,'Gita','MECH');
INSERT INTO offers VALUES (7,'Orion Devices',20.0);`,
  expected: {
    columns: ['name', 'branch', 'package_lpa'],
    rows: [
      ['Ananya', 'CSE', '24.0'],
      ['Farhan', 'CSE', '24.0'],
      ['Bilal', 'ECE', '21.0'],
      ['Devan', 'MECH', '15.0'],
    ],
  },
  hiddenExpected: {
    columns: ['name', 'branch', 'package_lpa'],
    rows: [
      ['Ananya', 'CSE', '24.0'],
      ['Farhan', 'CSE', '24.0'],
      ['Bilal', 'ECE', '21.0'],
      ['Gita', 'MECH', '20.0'],
    ],
  },
  starter: `SELECT s.name, s.branch, o.package_lpa FROM students s JOIN offers o ON o.student_id = s.id;`,
  origin: {
    source: 'LeetCode',
    title: 'Department Top Three Salaries / RANK() over a partition',
    url: 'https://leetcode.com/problems/department-top-three-salaries/',
  },
  hints: [
    'A CTE keeps this readable: `WITH ranked AS (SELECT ..., RANK() OVER (PARTITION BY branch ORDER BY package_lpa DESC) AS rnk FROM students JOIN offers ...) SELECT ... FROM ranked WHERE rnk = 1`.',
    'SQLite 3.25+ has window functions built in — no extension needed — but they cannot appear in a `WHERE`. Compute the rank in one query, filter on it in the next, which a CTE lets you write as one statement.',
    'If Devan (MECH, alone) is missing from your output, you filtered on a fixed number instead of the computed rank — a branch of one still has a rank-1 finisher.',
  ],
}

export const SQL_PROBLEMS: SqlProblem[] = [
  shortlistedCompanies,
  popularBranches,
  studentsWithoutOffers,
  aboveAverageCgpa,
  sameCompanyBatchmates,
  rankByPackage,
]

export const SQL_PROBLEM_MAP: Record<string, SqlProblem> = Object.fromEntries(
  SQL_PROBLEMS.map((p) => [p.id, p]),
)
