import { serviceGroups } from './services'
import { countryServices } from './countries'

// FP-07: This is an editorial service-inquiry inventory, NOT immigration advice,
// visa eligibility, a quote, or a licensed service approval. A service must not
// become "approved_for_enquiry" without business evidence and owner sign-off.
export type ServiceReviewStatus = 'needs_confirmation' | 'information_only' | 'approved_for_enquiry'
export type ServiceProof = {
  source: string
  reviewer: string
  reviewedAt: string
  validUntil: string
}
export type ServiceRecord = {
  slug: string
  title: string
  status: ServiceReviewStatus
  proof: ServiceProof | null
  price: null
  duration: null
  documents: null
  cancellationPolicy: null
}
const stableSlugs = [
  'visa-residency',
  'business-invitations',
  'flights-hotels',
  'pilgrimage-groups',
  'documents-consular',
  'travel-support',
] as const

export const serviceCatalog: readonly ServiceRecord[] = serviceGroups.map((group,index) => ({
  slug: stableSlugs[index],
  title: group.title,
  status: 'needs_confirmation' as const,
  proof: null,
  price: null,
  duration: null,
  documents: null,
  cancellationPolicy: null,
}))

// These 15 destinations were listed as possible business scope, not verified
// eligibility, availability, fees or documentation for a given passport.
export const serviceInquiryDestinations: readonly string[] = countryServices.map(c=>c.name)

export function serviceIsReadyForPublicOffer(record: ServiceRecord): boolean {
  return record.status === 'approved_for_enquiry' &&
    Boolean(record.proof?.source && record.proof.reviewer &&
      record.proof.reviewedAt && record.proof.validUntil &&
      Date.parse(record.proof.validUntil) > Date.now())
}

export function checkServiceCatalog(): string[] {
  const errors: string[] = []
  if (serviceCatalog.length !== 6 || serviceInquiryDestinations.length !== 15)
    errors.push('Unexpected service/destination count; reconcile with owner-approved scope.')
  if (new Set(serviceCatalog.map(s=>s.slug)).size !== serviceCatalog.length)
    errors.push('Service slugs must be unique.')
  if (new Set(serviceCatalog.map(s=>s.title)).size !== serviceCatalog.length)
    errors.push('Service titles must be unique.')
  for (const record of serviceCatalog) {
    if (!serviceGroups.some(group=>group.title===record.title))
      errors.push('Unrecognized service name: '+record.title)
    if (record.status==='approved_for_enquiry' && !serviceIsReadyForPublicOffer(record))
      errors.push('Approved service lacks valid review evidence: '+record.slug)
  }
  return errors
}
