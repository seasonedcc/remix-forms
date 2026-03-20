import { Link } from 'react-router'
import Heading from '~/ui/heading'
import SubHeading from '~/ui/sub-heading'

export default function Component() {
  return (
    <div className="flex flex-col gap-8 p-8 text-center sm:gap-16 sm:p-16">
      <Heading>Success! 🎉</Heading>
      <SubHeading>
        You&apos;ve been magically redirected here from our successful form!
      </SubHeading>
      <Link to="/examples" className="btn btn-primary self-center">
        Now check out our other examples 😄
      </Link>
    </div>
  )
}
