import ButtonLink from '~/ui/button-link'
import Heading from '~/ui/heading'
import SubHeading from '~/ui/sub-heading'
import type { Route } from './+types/success'

export default function Component({ params }: Route.ComponentProps) {
  return (
    <div className="flex flex-col space-y-8 p-8 text-center sm:space-y-16 sm:p-16">
      <Heading>Success! 🎉</Heading>
      <SubHeading>
        You&apos;ve been redirected here from our successful form!
      </SubHeading>
      <ButtonLink to={`/conf/${params.referrer}`}>Go back</ButtonLink>
    </div>
  )
}
