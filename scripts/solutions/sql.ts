/**
 * Reference solutions for `src/data/sql.ts`. Never imported by `src/`, so these
 * never reach the bundle — see docs/AUTHORING-PROBLEMS.md for why that split
 * exists for the coding problems; the same reasoning applies here.
 *
 * `scripts/verify-sql.mts` runs each of these against `schema + seed` and
 * `schema + seed + hiddenSeed` and checks the rows against `expected` /
 * `hiddenExpected` in `src/data/sql.ts`. Keyed by problem id.
 */
export const SQL_SOLUTIONS: Record<string, string> = {
  'sq-shortlisted-companies': `SELECT s.name, sl.company
FROM students s
JOIN shortlists sl ON sl.student_id = s.id;`,

  'sq-popular-branches': `SELECT s.branch, COUNT(*)
FROM offers o
JOIN students s ON s.id = o.student_id
GROUP BY s.branch
HAVING COUNT(*) > 1;`,

  'sq-students-without-offers': `SELECT s.name
FROM students s
LEFT JOIN offers o ON o.student_id = s.id
WHERE o.id IS NULL;`,

  'sq-above-average-cgpa': `SELECT name, cgpa
FROM students
WHERE cgpa > (SELECT AVG(cgpa) FROM students);`,

  'sq-same-company-batchmates': `SELECT a.name, b.name, a.company
FROM offers a
JOIN offers b ON a.company = b.company AND a.name < b.name;`,

  'sq-rank-by-package': `WITH ranked AS (
  SELECT s.name, s.branch, o.package_lpa,
         RANK() OVER (PARTITION BY s.branch ORDER BY o.package_lpa DESC) AS rnk
  FROM students s
  JOIN offers o ON o.student_id = s.id
)
SELECT name, branch, package_lpa FROM ranked WHERE rnk = 1;`,
}
