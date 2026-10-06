import type { CType, Signature } from '../harness'

/**
 * The bits every driver needs.
 *
 * A driver is the code we wrap around the student's method so it can be called
 * once per test case: it reads the arguments back out of stdin, times the call,
 * and prints one protocol line per case. Each language has its own file; this is
 * what they share.
 */

/** Marks a driver line. Anything else on stdout belongs to the student. */
export const MARK = '~#~'

/**
 * Reader call per type. The names are deliberately identical in every language,
 * so a driver is a translation of the same shape rather than a new design.
 * A new language must define all seven or it cannot express every problem.
 */
export const READ: Record<CType, string> = {
  int: '_rint()',
  double: '_rdbl()',
  boolean: '_rbool()',
  string: '_rstr()',
  'int[]': '_rints()',
  'string[]': '_rstrs()',
  'int[][]': '_rintss()',
}

export const argName = (i: number) => `_a${i}`

export const readArgs = (sig: Signature, decl: (name: string, call: string) => string) =>
  sig.params.map((p, i) => decl(argName(i), READ[p.type])).join('\n')

export const callArgs = (sig: Signature) => sig.params.map((_, i) => argName(i)).join(', ')
