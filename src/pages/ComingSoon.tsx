import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Hammer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UnderConstruction } from '@/components/art/UnderConstruction'

/**
 * Landing page for features that exist in the design but not yet in the build.
 *
 * Every placeholder control routes here with `?feature=` naming itself, so the
 * page can say which thing is missing instead of showing one generic apology.
 * A dead button that silently does nothing reads as a bug; this reads as a
 * roadmap.
 */
export default function ComingSoon() {
  const [params] = useSearchParams()
  const feature = params.get('feature')
  const from = params.get('from') ?? '/'

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-10 text-center sm:py-16">
      <UnderConstruction className="w-full max-w-xs sm:max-w-sm" />

      <span className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-[11px] font-medium text-accent">
        <Hammer className="size-3.5" />
        Being built
      </span>

      <h1 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
        {feature ? `${feature} is not ready yet` : 'This part is still being built'}
      </h1>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        The rest of the platform works. This piece is designed but not wired up, so rather than
        give you a button that quietly does nothing, it brings you here.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Link to={from}>
          <Button variant="primary">
            <ArrowLeft className="size-4" /> Back
          </Button>
        </Link>
        <Link to="/">
          <Button variant="secondary">Go to dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
