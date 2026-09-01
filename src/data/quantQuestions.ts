import type { Question } from './exams'

/**
 * Two quant-interview questions modelled on Chapter 1 ("Purely Quantitative &
 * Logic Questions") of Timothy Falcon Crack's *Heard on the Street*.
 *
 * Same rule as `questionBank.ts` and `docs/AUTHORING-PROBLEMS.md`: we do not
 * copy the book's text. Each question below is written from scratch — new
 * framing, new numbers where that's possible without changing the underlying
 * idea, new distractors — and names the original in `origin` so a student can
 * go work the source problem (and read Crack's own solution) afterwards.
 *
 * `origin` is the one field `Question` (see `./exams`) doesn't have. Rather
 * than bolt it onto the shared type — which every quiz question in the app
 * would then need to carry — it's added here as `QuantQuestion`, a strict
 * extension of `Question`. `HOTS_QUESTIONS` is typed as `QuantQuestion[]`,
 * which is assignable anywhere a `Question[]` is expected (an array of a
 * subtype is fine where the supertype is wanted); nothing about the existing
 * `Question` type has to change.
 */

export type QuantQuestion = Question & {
  /** The book question this was modelled on, so a student can read the original. */
  origin: {
    book: string
    /** e.g. "Q1.1" */
    question: string
    url: string
  }
}

export const HOTS_QUESTIONS: QuantQuestion[] = [
  {
    id: 'hots-q1-jugs',
    text:
      'In the unit-ops lab, two identical beakers each hold volume V of liquid — one pure ethanol, ' +
      'the other pure water. A TA draws off a quantity Q of water and stirs it into the ethanol beaker. ' +
      'Once it is thoroughly mixed, she draws off the same quantity Q of the now-diluted mixture and stirs ' +
      'it back into the water beaker, so both beakers are back to volume V. Compared with the fraction of ' +
      'water now sitting in the ethanol beaker, the fraction of ethanol now sitting in the water beaker is:',
    options: [
      'Larger, because the first transfer moved pure water while the second moved a diluted mixture',
      'Exactly the same',
      'Impossible to say without knowing the value of Q',
      'The same only if you stop after one round trip — repeating the swap would break the equality',
    ],
    answer: 1,
    explain:
      'No algebra needed. Both beakers end the exchange at volume V again, and nothing left the system — ' +
      'liquid only moved between the two beakers. So whatever volume of ethanol is now missing from the ' +
      'ethanol beaker has to be sitting somewhere, and the only place it can be is the water beaker. ' +
      'Symmetrically, whatever volume of water is missing from the water beaker is sitting in the ethanol ' +
      'beaker. Since a beaker\'s total volume is unchanged, "ethanol missing from the ethanol beaker" and ' +
      '"water missing from the water beaker" describe the exact same swapped volume seen from two sides — ' +
      'so the two fractions are identical. This holds for any Q up to V, and for any number of repeated ' +
      'round trips, precisely because it never depended on Q in the first place; the concentrations shift, ' +
      'but the symmetry that makes the two fractions equal does not. ' +
      '(Modelled on Heard on the Street, Q1.1 — the "elegant" answer Crack is fishing for is exactly this ' +
      'no-algebra argument; the mixture ratios do work out identically if you grind through the algebra, ' +
      'but doing so is the "brute-force technique" he says gives away that you missed the trick.)',
    origin: {
      book: 'Heard on the Street: Quantitative Questions from Wall Street Job Interviews',
      question: 'Q1.1',
      url: 'https://www.amazon.com/dp/1991155484',
    },
  },
  {
    id: 'hots-q4-gauss-sum',
    text:
      'The placement cell numbers every registration token from 1 to 100 for the day\'s walk-in drive. ' +
      'At the end of the day they want the sum of every token number issued, without adding 100 numbers ' +
      'by hand. What is 1 + 2 + 3 + ... + 100?',
    options: ['5000', '5050', '5100', '10100'],
    answer: 1,
    explain:
      'Pair the numbers from the outside in: (1 + 100), (2 + 99), (3 + 98), ..., (50 + 51). Every pair sums ' +
      'to 101, and there are 50 such pairs, so the total is 50 x 101 = 5050 — Gauss\'s trick, allegedly worked ' +
      'out as a bored schoolboy asked to add 1 to 100 to keep him busy. The general form is the one worth ' +
      'keeping: for 1 + 2 + ... + n, it is n(n+1)/2 (here, 100 x 101 / 2 = 5050). ' +
      '10100 is what you get if you pair correctly but forget the final halving — 100 x 101 without dividing ' +
      'by 2 double-counts every pair. 5100 comes from an off-by-one on the pairing itself, treating the run ' +
      'as if it needed 50 pairs that each sum to 102 rather than 101. 5000 is the "quick estimate" slip of ' +
      'using n^2/2 (100^2/2) instead of n(n+1)/2, dropping the "+1" that the pairing actually requires. ' +
      'Interviewers who ask this almost never stop here — the follow-up is to swap the range (say, 1 to 500, ' +
      'or 37 to 149), which the pairing trick alone won\'t save you on but the closed form n(n+1)/2 handles ' +
      'immediately. ' +
      '(Modelled on Heard on the Street, Q1.4.)',
    origin: {
      book: 'Heard on the Street: Quantitative Questions from Wall Street Job Interviews',
      question: 'Q1.4',
      url: 'https://www.amazon.com/dp/1991155484',
    },
  },
]
