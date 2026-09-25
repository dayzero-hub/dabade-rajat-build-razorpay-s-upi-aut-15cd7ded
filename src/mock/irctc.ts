// IRCTC PNR status — a status that ADVANCES over successive polls.
//
// The point of this mock is that the answer changes: a waitlist number comes down, then
// confirms. Sometimes a poll is slow, and sometimes one fails outright — your brief is about
// polling honestly through that, not about the happy path.
import { mockCall, MockApiError } from './client'

export type BookingStatus = 'WL' | 'RAC' | 'CNF' | 'CAN'

export interface PassengerStatus {
  name: string
  status: BookingStatus
  /** Waitlist position when status is WL, RAC number when RAC, else null. */
  number: number | null
  /** Set once confirmed. */
  coach?: string
  berth?: string
}

export interface PnrStatus {
  pnr: string
  trainNumber: string
  trainName: string
  from: string
  to: string
  /** ISO date of travel. */
  travelOn: string
  chartPrepared: boolean
  passengers: PassengerStatus[]
  /** Bumped on every change, so you can tell a real update from an identical re-render. */
  revision: number
}

const journeys: Record<string, Omit<PnrStatus, 'passengers' | 'revision' | 'chartPrepared'>> = {
  '2841739065': { pnr: '2841739065', trainNumber: '12951', trainName: 'Mumbai Rajdhani', from: 'MMCT', to: 'NDLS', travelOn: '2026-09-28' },
  '4517302988': { pnr: '4517302988', trainNumber: '12627', trainName: 'Karnataka Express', from: 'SBC', to: 'NDLS', travelOn: '2026-10-02' },
}

/** Poll count per PNR, so the status advances the way a real chart does. */
const polls = new Map<string, number>()

export function resetPnr(pnr: string) {
  polls.delete(pnr)
}

export async function getPnrStatus(pnr: string, signal?: AbortSignal): Promise<PnrStatus> {
  const slowPoll = Math.random() < 0.25
  return mockCall(() => {
    const journey = journeys[pnr]
    if (!journey) throw new MockApiError('PNR not found. Check the ten digits and try again.', 404)

    // One poll in six fails. A poller that gives up on the first error is the bug your brief is
    // looking for; so is one that hammers the endpoint after it.
    if (Math.random() < 0.16) {
      throw new MockApiError('Railway enquiry is busy. Retrying usually works.', 503)
    }

    const n = (polls.get(pnr) ?? 0) + 1
    polls.set(pnr, n)

    // Waitlist 8 → 5 → 3 → 1 → RAC → confirmed, one step per poll.
    const ladder: PassengerStatus[][] = [
      [{ name: 'R Dabade', status: 'WL', number: 8 }, { name: 'S Dabade', status: 'WL', number: 9 }],
      [{ name: 'R Dabade', status: 'WL', number: 5 }, { name: 'S Dabade', status: 'WL', number: 6 }],
      [{ name: 'R Dabade', status: 'WL', number: 3 }, { name: 'S Dabade', status: 'WL', number: 4 }],
      [{ name: 'R Dabade', status: 'RAC', number: 2 }, { name: 'S Dabade', status: 'WL', number: 1 }],
      [{ name: 'R Dabade', status: 'CNF', number: null, coach: 'B4', berth: '32 LB' },
       { name: 'S Dabade', status: 'RAC', number: 1 }],
      [{ name: 'R Dabade', status: 'CNF', number: null, coach: 'B4', berth: '32 LB' },
       { name: 'S Dabade', status: 'CNF', number: null, coach: 'B4', berth: '33 MB' }],
    ]
    const step = Math.min(n - 1, ladder.length - 1)

    return {
      ...journey,
      chartPrepared: step >= ladder.length - 1,
      passengers: ladder[step].map(p => ({ ...p })),
      revision: step,
    }
  }, slowPoll ? { minLatencyMs: 2500, maxLatencyMs: 4500 } : { minLatencyMs: 300, maxLatencyMs: 900 }, signal)
}

/** The two PNRs this mock knows. Anything else is a genuine 404 — build that state too. */
export const knownPnrs = Object.keys(journeys)
