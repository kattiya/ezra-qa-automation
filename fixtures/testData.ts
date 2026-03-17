/**
 * fixtures/testData.ts
 * Centralized test data — all from real staging environment.
 */

export const MEMBER = {
  email: 'kate.kuril@gmail.com',
  password: 'Fialka100',  // no space — confirmed from recording
  dateOfBirth: '02-22-1985',
  sex: 'Female' as const,
  phone: '(347) 977-0179',
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
 * Stripe test cards — from https://docs.stripe.com/testing
 * Safe to commit — only work in Stripe test mode.
 * Expiry format confirmed from recording: 'MM / YY' with spaces
 */
export const STRIPE = {
  validVisa: {
    number: '4242 4242 4242 4242',
    expiry: '09 / 28',   // format confirmed from recording
    cvc: '123',
    zip: '33180',
  },
  declinedCard: {
    number: '4000 0000 0000 0002',
    expiry: '09 / 28',
    cvc: '123',
    zip: '33180',
  },
};

export const CALENDAR = {
  // May 2026, day 2 — confirmed from recording
  // testId format: '{month}-{day}-cal-day-content'
  dayTestId: '5-2-cal-day-content',
};
