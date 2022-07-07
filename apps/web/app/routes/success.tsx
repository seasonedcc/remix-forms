import { $path } from 'remix-routes'
import ButtonLink from '~/ui/button-link'
import Heading from '~/ui/heading'
import SubHeading from '~/ui/sub-heading'

export default function Component() {
  return (
    <div className="flex flex-col space-y-8 sm:space-y-16 p-8 sm:p-16 text-center">
      <Heading>Success! 🎉</Heading>
      <SubHeading>
        You've been magically redirected here from our successful form!
      </SubHeading>
      <ButtonLink to={$path('/examples')}>
        Now check out our other examples 😄
      </ButtonLink>
    </div>
  )
}
