import type { Signature } from '../harness'
import { pythonDriver } from './python'
import { javascriptDriver } from './javascript'
import { cppDriver } from './cpp'
import { javaDriver } from './java'
import { goDriver, goStarter } from './go'
import { typescriptDriver, typescriptStarter } from './typescript'
import { csharpDriver, csharpStarter } from './csharp'
import { rustDriver, rustStarter } from './rust'

/**
 * The language registry.
 *
 * One entry per language the judge can run. Adding a language is: write
 * `drivers/<lang>.ts` with a `build` that wraps the student's method in a
 * runnable program, add a `starter` that generates a stub from a signature, and
 * register it here. Nothing else in the app needs to know.
 *
 * `Lang` is derived from this list rather than declared separately, so a
 * half-registered language is a type error rather than a runtime surprise.
 */

export type LangSpec = {
  id: string
  label: string
  /** File extension, for the download name and the editor's highlighter. */
  ext: string
  /**
   * Judge0 language ids, newest first. Intersected with what the instance
   * actually reports, because ids are per-instance: the public CE numbers
   * Python 3.13 as 109 while an older self-hosted Judge0 calls Python 3.8 71.
   * Omitted entirely when the language runs locally instead.
   */
  judge0?: number[]
  /** Passed to Judge0 as `compiler_options`. This is how C++ picks a standard. */
  compilerOptions?: string
  /** Which highlighter family the editor should use. */
  highlightAs?: 'c-like' | 'python' | 'javascript'
  /** Extra words the editor should colour, on top of the family's list. */
  keywords?: string
  build: (sig: Signature, userCode: string) => string
  /**
   * A stub generated from the signature, used when a problem ships no
   * hand-written starter for this language. The 28 problems written before the
   * registry existed all have hand-written Python/C++/Java/JS starters; anything
   * added later gets this instead, which is why a new language does not mean
   * writing 28 more stubs by hand.
   */
  starter: (sig: Signature) => string
}

/* ------------------------------------------------------------- stub generators */

const PY_TYPE: Record<string, string> = {
  int: 'int', double: 'float', boolean: 'bool', string: 'str',
  'int[]': 'List[int]', 'string[]': 'List[str]', 'int[][]': 'List[List[int]]',
}
const PY_ZERO: Record<string, string> = {
  int: '0', double: '0.0', boolean: 'False', string: "''",
  'int[]': '[]', 'string[]': '[]', 'int[][]': '[]',
}

const CPP_TYPE: Record<string, string> = {
  int: 'int', double: 'double', boolean: 'bool', string: 'string',
  'int[]': 'vector<int>&', 'string[]': 'vector<string>&', 'int[][]': 'vector<vector<int>>&',
}
const CPP_RET: Record<string, string> = {
  int: 'int', double: 'double', boolean: 'bool', string: 'string',
  'int[]': 'vector<int>', 'string[]': 'vector<string>', 'int[][]': 'vector<vector<int>>',
}
const CPP_ZERO: Record<string, string> = {
  int: '0', double: '0.0', boolean: 'false', string: '""',
  'int[]': '{}', 'string[]': '{}', 'int[][]': '{}',
}

const JAVA_TYPE: Record<string, string> = {
  int: 'int', double: 'double', boolean: 'boolean', string: 'String',
  'int[]': 'int[]', 'string[]': 'String[]', 'int[][]': 'int[][]',
}
const JAVA_ZERO: Record<string, string> = {
  int: '0', double: '0.0', boolean: 'false', string: '""',
  'int[]': 'new int[0]', 'string[]': 'new String[0]', 'int[][]': 'new int[0][0]',
}

const JS_DOC: Record<string, string> = {
  int: 'number', double: 'number', boolean: 'boolean', string: 'string',
  'int[]': 'number[]', 'string[]': 'string[]', 'int[][]': 'number[][]',
}
const JS_ZERO: Record<string, string> = {
  int: '0', double: '0', boolean: 'false', string: "''",
  'int[]': '[]', 'string[]': '[]', 'int[][]': '[]',
}

const params = (sig: Signature) => sig.params.map((p) => p.name).join(', ')

/* -------------------------------------------------------------------- registry */

export const LANG_SPECS = [
  {
    id: 'python',
    label: 'Python 3',
    ext: 'py',
    judge0: [109, 100, 92, 71],
    highlightAs: 'python',
    build: pythonDriver,
    starter: (sig) =>
      `from typing import List\n\nclass Solution:\n    def ${sig.name}(self, ${sig.params
        .map((p) => `${p.name}: ${PY_TYPE[p.type]}`)
        .join(', ')}) -> ${PY_TYPE[sig.returns]}:\n        # your code here\n        return ${PY_ZERO[sig.returns]}\n`,
  },
  {
    id: 'cpp',
    label: 'C++',
    ext: 'cpp',
    judge0: [105, 54, 53, 52, 76],
    // GCC 14 on the public instance; the standard is chosen per round, see CPP_STANDARDS.
    compilerOptions: '-std=c++17 -O2',
    highlightAs: 'c-like',
    build: cppDriver,
    starter: (sig) =>
      `class Solution {\npublic:\n    ${CPP_RET[sig.returns]} ${sig.name}(${sig.params
        .map((p) => `${CPP_TYPE[p.type]} ${p.name}`)
        .join(', ')}) {\n        // your code here\n        return ${CPP_ZERO[sig.returns]};\n    }\n};\n`,
  },
  {
    id: 'java',
    label: 'Java',
    ext: 'java',
    judge0: [91, 62],
    highlightAs: 'c-like',
    build: javaDriver,
    starter: (sig) =>
      `class Solution {\n    public ${JAVA_TYPE[sig.returns]} ${sig.name}(${sig.params
        .map((p) => `${JAVA_TYPE[p.type]} ${p.name}`)
        .join(', ')}) {\n        // your code here\n        return ${JAVA_ZERO[sig.returns]};\n    }\n}\n`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    ext: 'js',
    // No judge0 entry: this one runs in a Web Worker in the tab.
    highlightAs: 'javascript',
    build: javascriptDriver,
    starter: (sig) =>
      `/**\n${sig.params.map((p) => ` * @param {${JS_DOC[p.type]}} ${p.name}\n`).join('')} * @return {${JS_DOC[sig.returns]}}\n */\nvar ${sig.name} = function (${params(sig)}) {\n  // your code here\n  return ${JS_ZERO[sig.returns]}\n}\n`,
  },
  {
    id: 'go',
    label: 'Go',
    ext: 'go',
    judge0: [107, 106, 95, 60],
    highlightAs: 'c-like',
    keywords: 'chan defer func go interface map package range select struct type var nil make append len cap copy panic recover string int64 float64 bool error',
    build: goDriver,
    starter: goStarter,
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    ext: 'ts',
    judge0: [101, 94, 74],
    highlightAs: 'javascript',
    build: typescriptDriver,
    starter: typescriptStarter,
  },
  {
    id: 'rust',
    label: 'Rust',
    ext: 'rs',
    judge0: [108, 73],
    highlightAs: 'c-like',
    keywords: 'fn let mut impl trait struct enum match pub use crate mod self Self where dyn ref move as unsafe Vec String Option Some None Result Ok Err i32 i64 u32 u64 f64 usize bool str println vec iter collect unwrap',
    build: rustDriver,
    starter: rustStarter,
  },
  {
    id: 'csharp',
    label: 'C#',
    ext: 'cs',
    judge0: [51],
    highlightAs: 'c-like',
    keywords: 'using namespace public private protected internal static readonly sealed override virtual abstract partial var new class struct interface enum delegate event foreach in out ref params base this null true false string int long double bool decimal object List Dictionary HashSet Array Math Console WriteLine',
    build: csharpDriver,
    starter: csharpStarter,
  },
] as const satisfies readonly LangSpec[]

export type Lang = (typeof LANG_SPECS)[number]['id']

export const SPEC: Record<Lang, LangSpec> = Object.fromEntries(
  LANG_SPECS.map((s) => [s.id, s]),
) as Record<Lang, LangSpec>

export const LANGS: { id: Lang; label: string; ext: string }[] = LANG_SPECS.map((s) => ({
  id: s.id,
  label: s.label,
  ext: s.ext,
}))

/** Which languages never touch the network. */
export const isLocal = (lang: Lang) => !SPEC[lang].judge0

/* ------------------------------------------------------------- C++ standards */

/**
 * The standard is not a language — it is the same source file compiled with a
 * different flag, so it must not fork the student's code. Judge0 takes it as
 * `compiler_options`, verified against GCC 14 on the public instance:
 * `-std=c++23` reports `__cplusplus == 202302` and accepts `<print>` and
 * `ranges::fold_left`.
 */
export const CPP_STANDARDS = [
  { id: 'c++17', label: 'C++17', options: '-std=c++17 -O2' },
  { id: 'c++20', label: 'C++20', options: '-std=c++20 -O2' },
  { id: 'c++23', label: 'C++23', options: '-std=c++23 -O2' },
] as const

export type CppStandard = (typeof CPP_STANDARDS)[number]['id']

export const DEFAULT_CPP_STANDARD: CppStandard = 'c++17'

/** The flags to send for a run, given the language and the chosen C++ standard. */
export function compilerOptionsFor(lang: Lang, cppStandard: CppStandard): string | undefined {
  if (lang !== 'cpp') return SPEC[lang].compilerOptions
  return CPP_STANDARDS.find((s) => s.id === cppStandard)?.options ?? SPEC.cpp.compilerOptions
}
