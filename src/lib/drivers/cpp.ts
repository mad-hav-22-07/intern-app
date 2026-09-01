import type { Signature } from '../harness'
import { MARK, argName, callArgs, readArgs } from './shared'

/** C++ driver. `<bits/stdc++.h>` and `using namespace std` are added above the
 * student's class, which is why their starters need no includes. */
export function cppDriver(sig: Signature, user: string) {
  return `#include <bits/stdc++.h>
using namespace std;

${user}

// ------------------------------------------------------------------ harness
static string _rl() {
    string s;
    if (!getline(cin, s)) return string();
    if (!s.empty() && s.back() == '\\r') s.pop_back();
    return s;
}
static long long _rint() { return stoll(_rl()); }
static double _rdbl() { return stod(_rl()); }
static bool _rbool() { return _rl() == "1"; }
static string _rstr() { return _rl(); }
static vector<int> _rints() {
    int n = (int) _rint();
    string l = _rl();
    vector<int> v;
    v.reserve(n);
    istringstream is(l);
    int x;
    while ((int) v.size() < n && (is >> x)) v.push_back(x);
    return v;
}
static vector<string> _rstrs() {
    int n = (int) _rint();
    vector<string> v;
    for (int i = 0; i < n; i++) v.push_back(_rl());
    return v;
}
static vector<vector<int>> _rintss() {
    int r = (int) _rint();
    vector<vector<int>> a;
    for (int i = 0; i < r; i++) a.push_back(_rints());
    return a;
}
static string _fmt(bool v) { return v ? "true" : "false"; }
static string _fmt(int v) { return to_string(v); }
static string _fmt(long long v) { return to_string(v); }
static string _fmt(double v) { ostringstream o; o << v; return o.str(); }
static string _fmt(const string &v) { return v; }
template <class T> static string _fmt(const vector<T> &v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) s += ","; s += _fmt(v[i]); }
    return s + "]";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int _t = (int) _rint();
    Solution _sol;
    for (int _i = 0; _i < _t; _i++) {
${readArgs(sig, (n, c) => `        auto ${n} = ${c};`)}
        auto _c0 = chrono::steady_clock::now();
        try {
            auto _r = _sol.${sig.name}(${callArgs(sig)});
            auto _us = chrono::duration_cast<chrono::microseconds>(chrono::steady_clock::now() - _c0).count();
            cout << "${MARK}" << _i << "|1|" << _us << "|" << _fmt(_r) << "\\n" << flush;
        } catch (const exception &_e) {
            cout << "${MARK}" << _i << "|0|0|" << _e.what() << "\\n" << flush;
        } catch (...) {
            cout << "${MARK}" << _i << "|0|0|unknown exception" << "\\n" << flush;
        }
    }
    return 0;
}
`
}
