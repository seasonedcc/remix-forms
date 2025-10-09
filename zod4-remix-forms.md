We're in the middle of updating Remix Forms to support Zod 4 exclusively. We already updated our peer dependencies and upgraded our web app to use Zod 4's latest version.

The official Zod 4 migration guide can be found at ./zod4-migration-guide.md for referrence. Also, I have Zod 3's code checked out at ../zod3, and Zod 4's code checked out at ../zod4.

Because Remix Forms uses Zod's internal data structure for schema introspection, we had to read both versions' code to figure out what's not on the official migration guide.

We also continued the migration by writing our own zodResolver and removing the @hookform/resolvers from our project. For that, we copied the existing implementation that works for Zod 3 (it's checked out at ../resolvers with the correct version) and then started to adapt it to work with Zod 4.

However, tsc is failing and we need to make sure it passes while preserving our E2E inference/type safety. Please DO NOT REMOVE GENERICS and DO NOT ADD any unless strictly necessary.

Ultrathink.