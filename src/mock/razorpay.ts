// Razorpay UPI Autopay — a mock mandate API: create it, then poll its status.
//
// The app-redirect step can fail, which is the state your brief cares about most: the user has
// left for their UPI app and may come back having approved, declined, or nothing at all.
import { mockCall, MockApiError } from './client'

export type MandateStatus = 'created' | 'pending_approval' | 'active' | 'declined' | 'expired'

export interface MandateRequest {
  /** Rupees. The maximum that may be debited per cycle. */
  maxAmountInr: number
  frequency: 'monthly' | 'weekly' | 'as_presented'
  /** ISO date the mandate starts. */
  startOn: string
  payerVpa: string
}

export interface Mandate {
  id: string
  status: MandateStatus
  request: MandateRequest
  /** Where the user is sent to approve it. Deep-linking to a UPI app is the redirect step. */
  approvalUrl: string
  /** Set once the mandate reaches a terminal state. */
  completedAt?: string
}

const store = new Map<string, { mandate: Mandate; polls: number; outcome: MandateStatus }>()

/** Cycles through the outcomes so you meet all three without editing this file. */
const outcomes: MandateStatus[] = ['active', 'active', 'declined', 'expired']
let nextOutcome = 0

export async function createMandate(request: MandateRequest, signal?: AbortSignal): Promise<Mandate> {
  return mockCall(() => {
    const id = `mnd_${Math.random().toString(36).slice(2, 12)}`
    const mandate: Mandate = {
      id,
      status: 'created',
      request,
      approvalUrl: `upi://mandate?id=${id}`,
    }
    store.set(id, { mandate, polls: 0, outcome: outcomes[nextOutcome++ % outcomes.length] })
    return mandate
  }, { minLatencyMs: 400, maxLatencyMs: 1200 }, signal)
}

/**
 * The redirect to the UPI app. Rejects roughly one time in four — a real deep link fails when no
 * UPI app is installed, or the user dismisses the sheet. Your brief asks for that state.
 */
export async function openApprovalApp(mandateId: string, signal?: AbortSignal): Promise<{ opened: true }> {
  return mockCall(() => {
    const entry = store.get(mandateId)
    if (!entry) throw new MockApiError('Unknown mandate', 404)
    if (Math.random() < 0.25) {
      throw new MockApiError('No UPI app could be opened for this mandate.', 502)
    }
    entry.mandate.status = 'pending_approval'
    return { opened: true as const }
  }, { minLatencyMs: 200, maxLatencyMs: 600 }, signal)
}

/**
 * Poll after the redirect. Stays `pending_approval` for the first few polls — the user is in
 * another app — and then settles. A settled mandate keeps returning its terminal status.
 */
export async function getMandate(mandateId: string, signal?: AbortSignal): Promise<Mandate> {
  return mockCall(() => {
    const entry = store.get(mandateId)
    if (!entry) throw new MockApiError('Unknown mandate', 404)

    entry.polls += 1
    const settled = entry.mandate.status === 'active' || entry.mandate.status === 'declined' || entry.mandate.status === 'expired'
    if (!settled && entry.polls >= 3) {
      entry.mandate.status = entry.outcome
      entry.mandate.completedAt = new Date().toISOString()
    }
    return { ...entry.mandate }
  }, { minLatencyMs: 300, maxLatencyMs: 900 }, signal)
}
