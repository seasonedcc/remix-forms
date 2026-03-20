import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}

export default function Feature({ icon: Icon, title, children }: Props) {
  return (
    <div className="relative size-full rounded bg-base-100 p-4">
      <dt>
        <div className="absolute flex size-12 items-center justify-center rounded-md bg-primary text-primary-content">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <h4 className="ml-16 font-medium text-base-content text-lg leading-6">
          {title}
        </h4>
      </dt>
      <dd className="mt-2 ml-16 text-base text-base-content/60">{children}</dd>
    </div>
  )
}
