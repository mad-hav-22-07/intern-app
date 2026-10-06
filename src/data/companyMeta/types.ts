/**
 * Extra context about a company, beyond what the Blue Book prints.
 *
 * The Blue Books tell you how a company hires. They say almost nothing about
 * what it actually *does*, which is the thing a student needs before writing a
 * cover letter or answering "so why us?" — so this fills that in.
 *
 * Keyed by the company `name` exactly as it appears in `data/bluebook/*`, so a
 * firm with two roles or an entry in two seasons shares one record.
 *
 * Everything here must be verified, not recalled: a domain that 404s puts a
 * broken logo on the page, and an invented "what they do" is worse than a blank
 * one because a student may repeat it in an interview.
 */
export type CompanyMeta = {
  /** Bare registrable domain, e.g. `adobe.com`. Drives the logo. */
  domain?: string
  /** What the company does, in one or two plain sentences of our own words. */
  about?: string
  /** What kind of firm it is: "Prop trading", "Consulting", "FMCG"… */
  sector?: string
  /** Real, checked URLs. Careers page, engineering blog, anything genuinely useful. */
  links?: { label: string; url: string }[]
}

export type CompanyMetaMap = Record<string, CompanyMeta>
