import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Catches render-time crashes anywhere below it.
 *
 * Without this, one thrown error unmounts the whole React tree and the user is
 * left staring at a blank white page with no way forward. React has no hook
 * equivalent for this, so it has to stay a class component.
 *
 * Note what it does *not* catch: errors inside event handlers and promises. Those
 * are handled where they happen, which is why the forum hooks return an `error`
 * string rather than throwing.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Kept on the console rather than sent anywhere: there is no error reporting
    // service wired up, and inventing one would be worse than being honest.
    console.error('Unhandled render error:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="grid min-h-dvh place-items-center bg-bg p-6">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-danger/8 text-danger">
            <TriangleAlert className="size-6" />
          </span>

          <h1 className="mt-4 text-lg font-semibold tracking-tight">Something broke on this page</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The error is on our side, not yours. Your saved progress is untouched.
          </p>

          <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface-2 p-3 text-left font-mono text-[11px] text-muted">
            {error.message}
          </pre>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={() => this.setState({ error: null })}>
              <RotateCcw className="size-4" /> Try again
            </Button>
            <Button variant="secondary" onClick={() => (window.location.href = '/')}>
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
