/**
 * fixtures/testData.ts
 *
 * Centralized test data for the Ezra booking flow.
 * Keeping data separate from test logic makes it easy to update
 * values without touching test files.
 */

export const MEMBER = {
  dateOfBirth: '02-22-1985',
  sex: 'Female' as const,
};

export const SCAN = {
  type: 'MRI Scan' as const,
  price: '$999',
};

export const LOCATION = {
  state: 'Florida',
  name: 'Aventura',
};

/**
 * Stripe test cards — sourced from https://docs.stripe.com/testing
 * These are safe to commit — they only work in test/sandbox mode.
 */
export const STRIPE = {
  validVisa: {
    number: '4242 4242 4242 4242',
    expiry: '12/28',
    cvc: '123',
    zip: '33180',
  },
  declinedCard: {
    number: '4000 0000 0000 0002',
    expiry: '12/28',
    cvc: '123',
    zip: '33180',
  },
  insufficientFunds: {
    number: '4000 0000 0000 9995',
    expiry: '12/28',
    cvc: '123',
    zip: '33180',
  },
  expiredCard: {
    number: '4242 4242 4242 4242',
    expiry: '01/20', // past date
    cvc: '123',
    zip: '33180',
  },
};

export const CALENDAR = {
  // Day numbers to click — choose future weekdays
  // These should be adjusted based on the current month
  slotDayNumber: 1, // April 1, 2026 — first available weekday in test run
  numberOfSlotsRequired: 3,
};
