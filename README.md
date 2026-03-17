# Ezra QA Automation — Playwright Test Suite

> QA Engineer Assignment — Booking Flow E2E Automation  
> Built with Playwright + TypeScript using Page Object Model

---

## Table of Contents

- [Project Structure](#project-structure)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Cases Automated](#test-cases-automated)
- [Why These Tests?](#why-these-tests)
- [Architecture Decisions](#architecture-decisions)
- [Trade-offs & Assumptions](#trade-offs--assumptions)
- [Scalability](#scalability)
- [Future Improvements](#future-improvements)

---

## Project Structure

```
ezra-qa-automation/
├── pages/                        # Page Object Model classes
│   ├── SelectPlanPage.ts         # Step 1 — Select your Scan
│   ├── ScheduleScanPage.ts       # Step 2 — Schedule your Scan
│   ├── ReserveAppointmentPage.ts # Step 3 — Payment (Stripe)
│   └── ConfirmationPage.ts       # Booking confirmation
├── tests/                        # Test specs
│   ├── tc01-successful-booking.spec.ts    # TC-01: Happy path
│   ├── tc02-payment-declined.spec.ts      # TC-02: Declined card
│   └── tc03-three-slots-enforcement.spec.ts # TC-03: 3-slot rule
├── fixtures/
│   └── testData.ts               # Centralized test data & Stripe cards
├── utils/
│   └── bookingHelpers.ts         # Shared flow orchestration helpers
├── playwright.config.ts          # Playwright configuration
├── .env.example                  # Environment variable template
├── .gitignore
└── package.json
```

---

## Setup

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/ezra-qa-automation.git
cd ezra-qa-automation

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Set up environment variables
cp env.example .env
# Edit .env if needed — defaults point to staging
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Target environment base URL | `https://myezra-staging.ezra.com` |
| `STRIPE_VALID_CARD` | Stripe test card (success) | `4242424242424242` |
| `STRIPE_DECLINED_CARD` | Stripe test card (decline) | `4000000000000002` |

> Stripe test card numbers are safe to commit — they only work in Stripe's test/sandbox mode and cannot process real charges.

---

## Running Tests

```bash
# Run all tests (headless)
npx playwright test

# Run all tests with browser visible
npm run test:headed

# Run a specific test file
npx playwright test tests/tc01-successful-booking.spec.ts

# Run in debug mode (step through)
npm run test:debug

# View HTML report after a run
npm run test:report
```

---

## Test Cases Automated

| Test File | Test Case | Priority | Coverage |
|-----------|-----------|----------|----------|
| `tc01-successful-booking.spec.ts` | TC-01: End-to-end booking with valid Stripe card | Critical | Steps 1→2→3→Confirmation |
| `tc02-payment-declined.spec.ts` | TC-02: Declined card error + retry flow | Critical | Step 3 error path |
| `tc03-three-slots-enforcement.spec.ts` | TC-03: Continue disabled with < 3 slots | Critical | Step 2 validation (6 sub-tests) |

---

## Why These Tests?

### TC-01 — Successful end-to-end booking
This is the **core revenue transaction**. If this test fails in CI, it signals that Ezra cannot accept a booking — a P0 incident. Automating the full happy path provides the team with a fast regression signal on every deploy. No other test matters if this one is broken.

### TC-02 — Payment declined
Payment failures are the **second most common real-world scenario**. A silent failure or unhandled exception here can cause double-charges, orphaned booking records, or member confusion about whether they are booked. The error path must be as robust as the happy path — automating it ensures it never regresses silently. The retry test adds extra value by verifying users aren't stuck in a failed state.

### TC-03 — 3 time slots enforcement
This is a **hard operational constraint** — imaging centers cannot confirm appointments without 3 time preferences. This test has no payment step, making it the fastest and most stable test in the suite. It runs 6 sub-tests covering 0, 1, 2, and 3 slot states, removal behavior, and modal display — all pure UI validation, perfect for inclusion in a smoke test run.

---

## Architecture Decisions

### Page Object Model (POM)
Each step of the booking flow has a dedicated Page class that:
- Encapsulates all locators for that page
- Exposes semantic action methods (`selectScan()`, `fillCardDetails()`)
- Hides raw Playwright selectors from test files
- Makes tests readable as plain English

This means if a locator changes (e.g. a button label changes from "Continue" to "Next"), only the Page class needs updating — not every test.

### Separation of concerns
- **`pages/`** — What the page looks like and how to interact with it
- **`tests/`** — What we want to verify (assertions only)
- **`fixtures/`** — What data we use (all test data in one place)
- **`utils/`** — Shared orchestration (precondition setup reused across tests)

### Stripe iframe handling
Stripe card fields are rendered in sandboxed iframes. We use Playwright's `frameLocator()` to interact with them, with fallbacks for different Stripe integration patterns (Stripe Elements vs Stripe Link).

---

## Trade-offs & Assumptions

| Decision | Trade-off |
|----------|-----------|
| Tests run sequentially (`workers: 1`) | Slower but avoids booking conflicts on shared staging |
| Calendar day is hardcoded in `testData.ts` | Simple but fragile — will break if that day is unavailable. See Future Improvements. |
| Stripe error message matched with regex | More resilient than exact string but may miss subtle copy changes |
| No auth setup — tests assume member is pre-logged in | Simplifies tests but requires a valid session. CI pipeline should handle login as a precondition. |
| Tests run against staging only | Cannot run against production — Stripe test cards don't work in live mode |
| TC-02 only verifies UI error — not backend state | A full integration check would verify via API that no booking record was created |

---

## Scalability

This suite is designed to grow with the product:

- **Adding a new test** — Create a new `.spec.ts` file in `tests/`. Add shared data to `testData.ts`. New page steps get their own Page class in `pages/`.
- **Adding environments** — Update `BASE_URL` in `.env`. Add environment-specific config blocks in `playwright.config.ts`.
- **Parallel execution** — Set `workers: process.env.CI ? 4 : 1` and create isolated member accounts per test using a setup fixture.
- **CI/CD integration** — Add `npx playwright test --reporter=github` for GitHub Actions native test reporting.

---

## Future Improvements

Given more time, the following would be implemented:

1. **Dynamic calendar date selection** — Instead of a hardcoded day number, programmatically find the next available weekday from today's date.

2. **Auth fixture** — A Playwright `setup` project that logs in once, saves `storageState`, and reuses the session across all tests — eliminating the need for a pre-authenticated browser.

3. **API-level assertions** — After TC-01, call the Ezra API to verify a booking record was actually created with the correct details (not just that the UI showed a confirmation).

4. **Visual regression tests** — Add `@playwright/experimental-ct-react` or Percy integration to catch unintended UI changes to booking flow steps.

5. **Cross-browser testing** — Add Safari (WebKit) and Firefox projects to `playwright.config.ts` — especially important for Stripe iframe behavior.

6. **Test data cleanup** — After each test run, call the staging API to cancel/delete bookings created during testing to keep the staging environment clean.

7. **Allure reporting** — Replace the default HTML reporter with Allure for richer test history, trend analysis, and Jira integration.

---

## Notes on the Staging Environment

- The questionnaire can only be completed once per booking. Create a new member account per test run if re-testing the full flow.
- Stripe test mode is active on staging — use cards from [https://docs.stripe.com/testing](https://docs.stripe.com/testing).
- Do **not** reset the password for `michael.krakovsky+test_interview@functionhealth.com` as specified in the assignment.

---

## Author

QA Engineer Assignment Submission — March 2026
