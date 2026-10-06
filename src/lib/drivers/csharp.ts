import type { Signature } from '../harness'
import { MARK, callArgs, readArgs } from './shared'

/**
 * C# driver, targeting Judge0's `C# (Mono 6.6.0.161)`, id 51 on the public CE —
 * the only C# this instance has. Mono 6.6 ships an `mcs` that accepts pattern
 * matching (`is T x`), so C# 7-ish; it was probed directly against
 * `https://ce.judge0.com` before writing this (pattern matching, `Stopwatch`,
 * `CultureInfo.InvariantCulture`, `StringSplitOptions.RemoveEmptyEntries` all
 * compiled and ran). Nothing here uses C# 9+ (no top-level statements, no
 * records, no `init`, no target-typed `new`), so it should be fine even if a
 * slightly older/newer Mono ends up behind the same id.
 *
 * Student shape matches LeetCode's C# track: `public class Solution { public
 * <Ret> <PascalName>(<params>) { ... } }`. LeetCode's C# track uses PascalCase
 * method names (`TwoSum`, not `twoSum`), so the signature's camelCase name is
 * PascalCased both in the generated starter and at this driver's call site —
 * they must agree or the student's method never gets called.
 *
 * Type mapping:
 *  - `int` -> C# `long`. Signature `int` is a 32-bit-safe *value* per problem
 *    (nums/target/goal all sit within +/-1e9), but at least one problem in this
 *    bank (`cp-ar-donation-batches`, "Donation Batches") returns a *count* of
 *    subarrays that can exceed 2^31-1 for n=200000 inputs. Since a single
 *    driver serves every problem, `int` is widened to `long` uniformly rather
 *    than trying to special-case which problems need it.
 *  - `int[]` / `int[][]` -> C# `int[]` / `int[][]`. Every array-typed
 *    constraint in `src/data/problems/` keeps element values within +/-1e9,
 *    comfortably inside `int.MaxValue`, and `int[]` is what LeetCode's own C#
 *    track uses — so student code here reads the same as it would there.
 *  - `double` -> `double`, `boolean` -> `bool`, `string` -> `string`.
 */

const CS_METHOD: Record<Signature['returns'], string> = {
  int: 'long',
  double: 'double',
  boolean: 'bool',
  string: 'string',
  'int[]': 'int[]',
  'string[]': 'string[]',
  'int[][]': 'int[][]',
}

/** `twoSum` -> `TwoSum`. Every signature name in this bank is already camelCase. */
const pascal = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)

export function csharpDriver(sig: Signature, user: string) {
  const method = pascal(sig.name)
  return `using System;
using System.Globalization;
using System.Diagnostics;

${user}

// ------------------------------------------------------------------ harness
class Judge {
    static System.IO.TextReader _in = Console.In;

    static string _rl() {
        string s = _in.ReadLine();
        return s == null ? "" : s;
    }
    static long _rint() { return long.Parse(_rl().Trim(), CultureInfo.InvariantCulture); }
    static double _rdbl() { return double.Parse(_rl().Trim(), CultureInfo.InvariantCulture); }
    static bool _rbool() { return _rl().Trim() == "1"; }
    static string _rstr() { return _rl(); }
    static int[] _rints() {
        int n = (int) _rint();
        string l = _rl().Trim();
        if (n == 0 || l.Length == 0) return new int[0];
        string[] p = l.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
        int[] v = new int[n];
        for (int i = 0; i < n; i++) v[i] = int.Parse(p[i], CultureInfo.InvariantCulture);
        return v;
    }
    static string[] _rstrs() {
        int n = (int) _rint();
        string[] v = new string[n];
        for (int i = 0; i < n; i++) v[i] = _rl();
        return v;
    }
    static int[][] _rintss() {
        int r = (int) _rint();
        int[][] a = new int[r][];
        for (int i = 0; i < r; i++) a[i] = _rints();
        return a;
    }
    static string _fmt(object v) {
        if (v == null) return "null";
        if (v is bool vb) return vb ? "true" : "false";
        if (v is int[] via) {
            string[] parts = new string[via.Length];
            for (int i = 0; i < via.Length; i++) parts[i] = via[i].ToString(CultureInfo.InvariantCulture);
            return "[" + string.Join(",", parts) + "]";
        }
        if (v is int[][] viaa) {
            string[] parts = new string[viaa.Length];
            for (int i = 0; i < viaa.Length; i++) parts[i] = _fmt(viaa[i]);
            return "[" + string.Join(",", parts) + "]";
        }
        if (v is string[] vsa) {
            return "[" + string.Join(",", vsa) + "]";
        }
        if (v is double vd) return vd.ToString(CultureInfo.InvariantCulture);
        if (v is long vl) return vl.ToString(CultureInfo.InvariantCulture);
        if (v is string vs) return vs;
        return v.ToString();
    }

    static void Main(string[] _args) {
        long _t = _rint();
        Solution _sol = new Solution();
        for (long _i = 0; _i < _t; _i++) {
${readArgs(sig, (n, c) => `            var ${n} = ${c};`)}
            Stopwatch _sw = Stopwatch.StartNew();
            try {
                var _r = _sol.${method}(${callArgs(sig)});
                _sw.Stop();
                long _us = _sw.ElapsedTicks * 1000000L / Stopwatch.Frequency;
                Console.WriteLine("${MARK}" + _i + "|1|" + _us + "|" + _fmt(_r));
            } catch (Exception _e) {
                string _m = (_e.GetType().Name + ": " + _e.Message).Replace("\\n", " ");
                Console.WriteLine("${MARK}" + _i + "|0|0|" + _m);
            }
            Console.Out.Flush();
        }
    }
}
`
}

const CS_ZERO: Record<Signature['returns'], string> = {
  int: '0',
  double: '0.0',
  boolean: 'false',
  string: '""',
  'int[]': 'new int[0]',
  'string[]': 'new string[0]',
  'int[][]': 'new int[0][]',
}

export function csharpStarter(sig: Signature) {
  const method = pascal(sig.name)
  const params = sig.params.map((p) => `${CS_METHOD[p.type]} ${p.name}`).join(', ')
  return `public class Solution {
    public ${CS_METHOD[sig.returns]} ${method}(${params}) {
        // your code here
        return ${CS_ZERO[sig.returns]};
    }
}
`
}

/** `C# (Mono 6.6.0.161)` on the public CE. It is the only C# this instance has. */
export const csharpJudge0: number[] = [51]
