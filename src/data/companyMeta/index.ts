import type { CompanyMeta, CompanyMetaMap } from './types'
import { META_A_L } from './a-l'
import { META_M_Z } from './m-z'

export type { CompanyMeta, CompanyMetaMap } from './types'

/**
 * What each company actually does, merged from the two research passes.
 *
 * Keyed by the company `name` exactly as the Blue Book prints it, so a firm with
 * two roles or an entry in two seasons resolves to the same record. A company we
 * could not identify with confidence is simply absent — `metaFor` returns
 * `undefined` and every consumer treats that as "no extra context", never as an
 * empty string to render.
 */
const META: CompanyMetaMap = { ...META_A_L, ...META_M_Z }

export function metaFor(name: string): CompanyMeta | undefined {
  return META[name]
}

export const META_COUNT = Object.keys(META).length
