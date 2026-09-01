import type { CType, Signature } from '../harness'
import { MARK, argName, callArgs, readArgs } from './shared'

/**
 * Go driver.
 *
 * Go has no classes, so the student implements a plain package-level function
 * — `func twoSum(nums []int, target int) []int { ... }` — instead of a method
 * on a `Solution`. The driver is everything else in `package main`: readers,
 * a formatter, and a `main()` that reads the case count, calls the student's
 * function once per case inside a `recover()`-guarded closure, times it, and
 * prints one protocol line, flushing as it goes (writes go straight to
 * `os.Stdout` via `fmt.Printf`, never through a buffered writer, so there is
 * nothing to flush).
 *
 * The student's code sits between our own `import` block and our harness's
 * top-level declarations. Go allows more than one `import` declaration in a
 * file as long as all of them precede every other top-level declaration, so a
 * student who needs `sort` or `strings` can add their own import line above
 * their function and it is still legal.
 */
export function goDriver(sig: Signature, user: string) {
  return `package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

${user}

// ------------------------------------------------------------------ harness
var _in *bufio.Reader

func _rl() string {
	s, _ := _in.ReadString('\\n')
	return strings.TrimRight(s, "\\r\\n")
}
func _rint() int {
	v, _ := strconv.Atoi(strings.TrimSpace(_rl()))
	return v
}
func _rdbl() float64 {
	v, _ := strconv.ParseFloat(strings.TrimSpace(_rl()), 64)
	return v
}
func _rbool() bool {
	return strings.TrimSpace(_rl()) == "1"
}
func _rstr() string {
	return _rl()
}
func _rints() []int {
	n := _rint()
	line := strings.TrimSpace(_rl())
	if n == 0 || line == "" {
		return []int{}
	}
	parts := strings.Fields(line)
	v := make([]int, n)
	for i := 0; i < n; i++ {
		x, _ := strconv.Atoi(parts[i])
		v[i] = x
	}
	return v
}
func _rstrs() []string {
	n := _rint()
	v := make([]string, n)
	for i := 0; i < n; i++ {
		v[i] = _rl()
	}
	return v
}
func _rintss() [][]int {
	r := _rint()
	a := make([][]int, r)
	for i := 0; i < r; i++ {
		a[i] = _rints()
	}
	return a
}

func _fmt(v interface{}) string {
	switch x := v.(type) {
	case nil:
		return "null"
	case bool:
		if x {
			return "true"
		}
		return "false"
	case int:
		return strconv.Itoa(x)
	case float64:
		return strconv.FormatFloat(x, 'g', 6, 64)
	case string:
		return x
	case []int:
		parts := make([]string, len(x))
		for i, e := range x {
			parts[i] = strconv.Itoa(e)
		}
		return "[" + strings.Join(parts, ",") + "]"
	case []string:
		return "[" + strings.Join(x, ",") + "]"
	case [][]int:
		parts := make([]string, len(x))
		for i, e := range x {
			parts[i] = _fmt(e)
		}
		return "[" + strings.Join(parts, ",") + "]"
	default:
		return fmt.Sprintf("%v", x)
	}
}

func _run(i int, fn func() interface{}) {
	_t0 := time.Now()
	defer func() {
		if r := recover(); r != nil {
			_m := strings.ReplaceAll(fmt.Sprintf("%v", r), "\\n", " ")
			fmt.Printf("${MARK}%d|0|0|%s\\n", i, _m)
		}
	}()
	_r := fn()
	_us := time.Since(_t0).Microseconds()
	fmt.Printf("${MARK}%d|1|%d|%s\\n", i, _us, _fmt(_r))
}

func main() {
	_in = bufio.NewReaderSize(os.Stdin, 1<<20)
	_t := _rint()
	for _i := 0; _i < _t; _i++ {
${readArgs(sig, (n, c) => `\t\t${n} := ${c}`)}
		_run(_i, func() interface{} {
			return ${sig.name}(${callArgs(sig)})
		})
	}
}
`
}

/* ------------------------------------------------------------------ starter */

const GO_TYPE: Record<CType, string> = {
  int: 'int',
  double: 'float64',
  boolean: 'bool',
  string: 'string',
  'int[]': '[]int',
  'string[]': '[]string',
  'int[][]': '[][]int',
}

const GO_ZERO: Record<CType, string> = {
  int: '0',
  double: '0',
  boolean: 'false',
  string: '""',
  'int[]': 'nil',
  'string[]': 'nil',
  'int[][]': 'nil',
}

/** A package-level function is the natural Go shape — there are no classes to
 * hang a method off, so the student writes exactly what the driver calls. */
export function goStarter(sig: Signature): string {
  const params = sig.params.map((p) => `${p.name} ${GO_TYPE[p.type]}`).join(', ')
  return `// ${sig.name} is called once per test case.
func ${sig.name}(${params}) ${GO_TYPE[sig.returns]} {
	// your code here
	return ${GO_ZERO[sig.returns]}
}
`
}

/** Judge0 public CE: Go 1.23.5, newest first. */
export const goJudge0: number[] = [107, 106, 95, 60]
