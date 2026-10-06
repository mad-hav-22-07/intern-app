import type { Signature } from '../harness'
import { MARK, argName, callArgs, readArgs } from './shared'

/**
 * JavaScript driver. Runs as a Function body in the local worker, so the
 * student's `var twoSum = ...` and this driver share one scope and it can simply
 * call the name.
 */
export function javascriptDriver(sig: Signature, user: string) {
  // Runs as a Function body in the worker, so the student's `var twoSum = ...`
  // and this driver share one scope and it can simply call the name.
  return `${user}

/* ------------------------------------------------------------------ harness */
;(function () {
  function _rint() { return parseInt(readline(), 10) }
  function _rdbl() { return parseFloat(readline()) }
  function _rbool() { return readline().trim() === '1' }
  function _rstr() { return readline() }
  function _rints() {
    var n = _rint(), l = readline().trim()
    return n && l ? l.split(/\\s+/).map(Number) : []
  }
  function _rstrs() { var n = _rint(), a = []; for (var i = 0; i < n; i++) a.push(readline()); return a }
  function _rintss() { var r = _rint(), a = []; for (var i = 0; i < r; i++) a.push(_rints()); return a }
  function _fmt(v) {
    if (v === null || v === undefined) return 'null'
    if (Array.isArray(v)) return '[' + v.map(_fmt).join(',') + ']'
    if (typeof v === 'boolean') return v ? 'true' : 'false'
    return String(v)
  }
  var _t = _rint()
  for (var _i = 0; _i < _t; _i++) {
${readArgs(sig, (n, c) => `    var ${n} = ${c}`)}
    var _t0 = performance.now()
    try {
      var _r = ${sig.name}(${callArgs(sig)})
      print('${MARK}' + _i + '|1|' + Math.round((performance.now() - _t0) * 1000) + '|' + _fmt(_r))
    } catch (_e) {
      var _m = String((_e && _e.message) || _e).replace(/\\n/g, ' ')
      print('${MARK}' + _i + '|0|' + Math.round((performance.now() - _t0) * 1000) + '|' + _m)
    }
  }
})()
`
}
