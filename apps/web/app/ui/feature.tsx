type Props = {
  icon: React.ComponentType<JSX.IntrinsicElements['svg']>
  title: string
  children: React.ReactNode
}

export default function Feature({ icon: Icon, title, children }: Props) {
  return (
    <div className="relative h-full w-full rounded bg-white/20 p-4">
      <dt>
        <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-pink-500 text-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h4 className="ml-16 text-lg font-medium leading-6 text-gray-300">
          {title}
        </h4>
      </dt>
      <dd className="mt-2 ml-16 text-base text-gray-200">{children}</dd>
    </div>
  )
}
