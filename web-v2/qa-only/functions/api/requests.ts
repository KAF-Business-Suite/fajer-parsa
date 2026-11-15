// QA-only Cloudflare Pages Functions entry. Not in the project's live
// functions/ directory and NEVER bundled into normal static/production deploys.
// Manual rollout requires isolated QA credentials, origin, binding and tests.
export {onRequest} from '../../../server/intake/pages-entry.ts'
