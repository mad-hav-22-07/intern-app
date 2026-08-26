import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/ui/Page'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <EmptyState
      icon={<Compass className="size-6" />}
      title="Nothing here yet"
      sub="This route is not part of the prototype. Use the sidebar to get back."
      action={
        <Link to="/">
          <Button variant="primary">Back to dashboard</Button>
        </Link>
      }
    />
  )
}
