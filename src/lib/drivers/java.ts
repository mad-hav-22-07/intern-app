import type { Signature } from '../harness'
import { MARK, argName, callArgs, readArgs } from './shared'

/** Java driver. The student's class is package-private `Solution`; `Main` here is
 * the public one, which is what the file must be named after. */
export function javaDriver(sig: Signature, user: string) {
  return `import java.io.*;
import java.util.*;

${user}

// ------------------------------------------------------------------ harness
public class Main {
    static BufferedReader _in = new BufferedReader(new InputStreamReader(System.in));

    static String _rl() throws IOException {
        String s = _in.readLine();
        return s == null ? "" : s;
    }
    static int _rint() throws IOException { return Integer.parseInt(_rl().trim()); }
    static double _rdbl() throws IOException { return Double.parseDouble(_rl().trim()); }
    static boolean _rbool() throws IOException { return _rl().trim().equals("1"); }
    static String _rstr() throws IOException { return _rl(); }
    static int[] _rints() throws IOException {
        int n = _rint();
        String l = _rl().trim();
        if (n == 0 || l.isEmpty()) return new int[0];
        String[] p = l.split("\\\\s+");
        int[] v = new int[n];
        for (int i = 0; i < n; i++) v[i] = Integer.parseInt(p[i]);
        return v;
    }
    static String[] _rstrs() throws IOException {
        int n = _rint();
        String[] v = new String[n];
        for (int i = 0; i < n; i++) v[i] = _rl();
        return v;
    }
    static int[][] _rintss() throws IOException {
        int r = _rint();
        int[][] a = new int[r][];
        for (int i = 0; i < r; i++) a[i] = _rints();
        return a;
    }
    static String _fmt(Object v) {
        if (v == null) return "null";
        if (v instanceof int[]) {
            int[] a = (int[]) v;
            StringBuilder b = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) b.append(','); b.append(a[i]); }
            return b.append(']').toString();
        }
        if (v instanceof int[][]) {
            int[][] a = (int[][]) v;
            StringBuilder b = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) b.append(','); b.append(_fmt(a[i])); }
            return b.append(']').toString();
        }
        if (v instanceof Object[]) {
            Object[] a = (Object[]) v;
            StringBuilder b = new StringBuilder("[");
            for (int i = 0; i < a.length; i++) { if (i > 0) b.append(','); b.append(_fmt(a[i])); }
            return b.append(']').toString();
        }
        if (v instanceof List) {
            StringBuilder b = new StringBuilder("[");
            List<?> l = (List<?>) v;
            for (int i = 0; i < l.size(); i++) { if (i > 0) b.append(','); b.append(_fmt(l.get(i))); }
            return b.append(']').toString();
        }
        return String.valueOf(v);
    }

    public static void main(String[] _args) throws IOException {
        int _t = _rint();
        Solution _sol = new Solution();
        for (int _i = 0; _i < _t; _i++) {
${readArgs(sig, (n, c) => `            var ${n} = ${c};`)}
            long _n0 = System.nanoTime();
            try {
                var _r = _sol.${sig.name}(${callArgs(sig)});
                long _us = (System.nanoTime() - _n0) / 1000;
                System.out.println("${MARK}" + _i + "|1|" + _us + "|" + _fmt(_r));
            } catch (Throwable _e) {
                String _m = (_e.getClass().getSimpleName() + ": " + _e.getMessage()).replace("\\n", " ");
                System.out.println("${MARK}" + _i + "|0|0|" + _m);
            }
            System.out.flush();
        }
    }
}
`
}
