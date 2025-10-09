We're in the middle of updating Remix Forms to support Zod 4 exclusively. We already updated our peer dependencies and upgraded our web app to use Zod 4's latest version.

The official Zod 4 migration guide can be found at ./zod4-migration-guide.md for referrence. Also, I have Zod 3's code checked out at ../zod3, and Zod 4's code checked out at ../zod4.

Because Remix Forms uses Zod's internal data structure for schema introspection, we had to read both versions' code to figure out what's not on the official migration guide.

Let's continue the migration by fixing our failing E2E tests. Our last run's report is at ./e2e.txt. If the failure is due to copy change on Zod's side but the logic is still the same, let's update the tests with the new copy. If the logic has changed, let's fix our code. Make as few breaking changes as possible.

Ultrathink.