type Props = {
  icon: React.ComponentType<JSX.IntrinsicElements['svg']>
  title: string
  children: React.ReactNode
}

export default function Feature({ icon: Icon, title, children }: Props) {
  return (
    <div className="relative bg-white/20 w-full h-full p-4 rounded">
      <dt>
        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-pink-500 text-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h4 className="ml-16 text-lg leading-6 font-medium text-gray-300">
          {title}
        </h4>
      </dt>
      <dd className="mt-2 ml-16 text-base text-gray-200">{children}</dd>
    </div>
  )
}
