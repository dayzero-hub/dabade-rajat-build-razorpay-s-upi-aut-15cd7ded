# fe-v2-react-ts-mockapi

A React + TypeScript starter with a **mock API** — calls that take a realistic amount of time and
can fail — plus a token file for colours and spacing. There is no server to run and nothing to
configure: `src/mock/` is the API.

## Run it

```bash
npm install
npm run dev
```

The dev server prints **http://localhost:5173**. Do this before you change anything: if it starts,
anything that breaks later is your code rather than your setup.

Node **18+** and npm **9+** (`node --version`, `npm --version`; install the LTS build from
https://nodejs.org if either is missing, then open a new terminal).

```bash
npm run build     # type-check the whole project and build for production
npm run preview   # serve that build locally
```

## The mock API

Every endpoint goes through `mockCall` in `src/mock/client.ts`, which adds latency, can fail, and
honours an `AbortSignal`. Three things it gives you:

- **A loading state that lasts long enough to see.** Raise `mockConfig.minLatencyMs` while you
  build it.
- **An error state you can reproduce on demand.** Set `mockConfig.failureRate = 1` and every call
  fails; set it back to `0` when you are done.
- **Cancellation.** Pass an `AbortSignal` and an outdated call rejects with an `AbortError`, so a
  slow first answer cannot overwrite a fast second one.

```ts
import { mockConfig } from './mock/client'
mockConfig.failureRate = 1      // every call now fails
mockConfig.minLatencyMs = 3000  // and takes three seconds to do it
```

## Find your module

This template is shared by several projects. Open the one named for yours and read its types
before you render anything.

| Project | File | What it does |
|---|---|---|
| Razorpay — UPI Autopay mandate | `src/mock/razorpay.ts` | create a mandate, open the approval app (which can fail), poll until it settles |
| CRED — statement view | `src/mock/cred.ts` | a month of transactions, with genuine duplicates and fees seeded |
| IRCTC — PNR status | `src/mock/irctc.ts` | a status that advances over successive polls; some polls are slow, some fail |
| Meesho — address capture | `src/mock/meesho.ts` | PIN → city, state; sometimes several areas, sometimes a miss |
| Tata 1mg — medicine search | `src/mock/onemg.ts` | autocomplete and search, every item flagged Rx or OTC |
| Zomato — Shorts feed | `src/mock/zomato.ts` | a paginated reel feed; the clips are real files in `public/clips/` |

The modules for other projects do no harm — delete the ones you are not using if you would rather
have a clean tree.

## What is deliberately NOT in here

The screen you were asked to build. The polling, the debouncing, the cancellation, the states and
the rules your tickets describe are the project — this repository is the starting point, not a
worked example.
