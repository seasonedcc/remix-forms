import { MetaFunction } from '@remix-run/node'
import { metaTags } from '~/helpers'
import Heading from '~/ui/heading'
import SubHeading from '~/ui/sub-heading'
import Feature from '~/ui/feature'
import {
  ClipboardListIcon,
  GiftIcon,
  SparklesIcon,
} from '@heroicons/react/outline'
import ExternalLink from '~/ui/external-link'
import ButtonLink from '~/ui/button-link'

const title = 'Remix Conf 2022'
const description = 'Welcome to the interactive counterpart to our talk 😄'

export const meta: MetaFunction = () => metaTags({ title, description })

export default function Component() {
  return (
    <div className="flex flex-col space-y-8">
      <Heading>Remix Forms at Remix Conf</Heading>
      <SubHeading>{description}</SubHeading>
      <div className="flex flex-col space-y-8 xl:flex-row xl:space-y-0 xl:space-x-8">
        <div className="flex-[3]">
          <iframe
            className="aspect-video w-full"
            src="https://www.youtube.com/embed/IN-TElTkVmU"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <dl className="flex flex-[2] flex-col space-y-8">
          <Feature icon={ClipboardListIcon} title="A great form UI takes work">
            First, we'll walk you through the creation of a great form UI from
            scratch.
          </Feature>
          <Feature icon={SparklesIcon} title="We do the work for you">
            Then, we'll show you how Remix Forms does all the work for you.
          </Feature>
          <Feature icon={GiftIcon} title="With a powerful DX">
            <ExternalLink href="https://github.com/SeasonedSoftware/remix-forms-site/tree/main/app/routes/conf">
              Play around
            </ExternalLink>{' '}
            to experience our end-to-end type safety and our flexible API.
          </Feature>
        </dl>
      </div>
      <p className="text-lg">
        Check out the{' '}
        <ExternalLink href="https://github.com/SeasonedSoftware/remix-forms-site/tree/main/app/routes/conf">
          complete code for the examples
        </ExternalLink>
        .
      </p>
      <div className="flex justify-center">
        <ButtonLink to="01">Let's Start</ButtonLink>
      </div>
    </div>
  )
}
