import ButtonLink from '~/ui/button-link'
import Heading from '~/ui/heading'
import SubHeading from '~/ui/sub-heading'

export default function Component() {
  return (
    <div className="flex flex-col space-y-8 p-8 text-center sm:space-y-16 sm:p-16">
      <Heading>Success! 🎉</Heading>
      <SubHeading>
        You've been magically redirected here from our successful form!
      </SubHeading>
      <ButtonLink to={'/examples'}>
        Now check out our other examples 😄
      </ButtonLink>
    </div>
  )
}
