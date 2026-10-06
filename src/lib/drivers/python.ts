import type { Signature } from '../harness'
import { MARK, argName, callArgs, readArgs } from './shared'

/** Python driver. `Solution()` is built once and its method called per case. */
export function pythonDriver(sig: Signature, user: string) {
  return `import sys
import time
from typing import List, Optional, Dict, Set, Tuple

${user}

# ------------------------------------------------------------------- harness
def _rl():
    _s = sys.stdin.readline()
    if _s.endswith('\\n'):
        _s = _s[:-1]
    if _s.endswith('\\r'):
        _s = _s[:-1]
    return _s

def _rint():
    return int(_rl().strip())

def _rdbl():
    return float(_rl().strip())

def _rbool():
    return _rl().strip() == '1'

def _rstr():
    return _rl()

def _rints():
    _n = _rint()
    _l = _rl()
    return [int(_x) for _x in _l.split()] if _n else []

def _rstrs():
    _n = _rint()
    return [_rl() for _ in range(_n)]

def _rintss():
    _r = _rint()
    return [_rints() for _ in range(_r)]

def _fmt(_v):
    if _v is True:
        return 'true'
    if _v is False:
        return 'false'
    if _v is None:
        return 'null'
    if isinstance(_v, (list, tuple)):
        return '[' + ','.join(_fmt(_x) for _x in _v) + ']'
    if isinstance(_v, float):
        return ('%g' % _v)
    return str(_v)

def _emit(_line):
    sys.stdout.write(_line + '\\n')
    sys.stdout.flush()

def _main():
    _t = _rint()
    _sol = Solution()
    for _i in range(_t):
${readArgs(sig, (n, c) => `        ${n} = ${c}`)}
        _t0 = time.perf_counter()
        try:
            _r = _sol.${sig.name}(${callArgs(sig)})
            _us = int((time.perf_counter() - _t0) * 1000000)
            _emit('${MARK}%d|1|%d|%s' % (_i, _us, _fmt(_r)))
        except Exception as _e:
            _us = int((time.perf_counter() - _t0) * 1000000)
            _msg = ('%s: %s' % (type(_e).__name__, _e)).replace('\\n', ' ')
            _emit('${MARK}%d|0|%d|%s' % (_i, _us, _msg))

_main()
`
}
