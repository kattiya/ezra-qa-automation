# Ezra Booking Flow — Top 15 Test Cases (Part 1)

**Scope:** First three steps of the booking flow, including payment  
**Flow Covered:** Select Plan -> Schedule Scan -> Reserve Appointment -> Confirmation handoff  
**Environment:** Staging / test environment  
**Ordering:** Most important to least important

---

## 1. TC-01 — Successful end-to-end booking with valid payment
**Priority:** P0  
**Type:** Happy path / revenue-critical

**Preconditions**
- User can access the booking flow
- At least one location/date with 3 available slots exists
- Valid test payment card is available

**Steps**
1. Open the booking flow
2. Select a scan type
3. Enter required member details on Step 1
4. Continue to Step 2
5. Select a state and location
6. Select a date with availability
7. Select 3 time slots
8. Continue to Step 3
9. Enter valid payment details
10. Click Continue

**Expected Result**
- User is redirected to the confirmation page
- Booking summary shows the correct scan type, location, and 3 selected slots
- No payment or validation error is displayed
- A booking confirmation / next-step CTA is visible

---

## 2. TC-02 — Declined card is handled gracefully and blocks booking
**Priority:** P0  
**Type:** Negative / payment handling

**Preconditions**
- User has completed Step 1 and Step 2 successfully
- Declined test card is available

**Steps**
1. Reach the Reserve Appointment page
2. Enter a declined test card
3. Submit payment

**Expected Result**
- User remains on the payment page
- A clear payment error is shown
- No booking is created
- User can retry payment without losing booking selections

---

## 3. TC-03 — User cannot continue unless exactly 3 time slots are selected
**Priority:** P0  
**Type:** Validation / business-rule enforcement

**Preconditions**
- User has completed Step 1
- A location/date with at least 3 slots is available

**Steps**
1. Go to Schedule Scan
2. Select only 1 slot
3. Verify Continue is disabled
4. Select a 2nd slot
5. Verify Continue is still disabled
6. Select a 3rd slot
7. Verify Continue becomes enabled
8. Remove one slot
9. Verify Continue disables again

**Expected Result**
- Continue stays disabled with fewer than 3 slots
- Continue enables only when 3 slots are selected
- Removing a slot re-disables Continue

---

## 4. TC-04 — Required fields on Step 1 gate progression
**Priority:** P1  
**Type:** Validation

**Preconditions**
- User is on Select Plan

**Steps**
1. Leave required fields blank
2. Enter DOB only
3. Enter DOB and sex only
4. Select scan only
5. Complete all required fields

**Expected Result**
- Continue remains disabled until all required inputs are provided
- Continue enables only when DOB, sex, and scan selection are complete

---

## 5. TC-05 — Invalid DOB values are rejected
**Priority:** P1  
**Type:** Negative / field validation

**Preconditions**
- User is on Select Plan

**Steps**
1. Enter an invalid DOB format
2. Enter an impossible date
3. Enter a future date
4. Enter an underage DOB if adults-only logic applies

**Expected Result**
- Invalid values are rejected or flagged clearly
- Continue remains disabled

---

## 6. TC-06 — Correct scan type and price carry through to payment summary
**Priority:** P1  
**Type:** Data integrity

**Preconditions**
- Multiple scan types are available

**Steps**
1. Select a scan type on Step 1
2. Complete scheduling selections
3. Reach the payment page

**Expected Result**
- Payment summary shows the correct scan type
- Displayed price matches the selected product

---

## 7. TC-07 — Location filtering by state returns the correct centers
**Priority:** P1  
**Type:** Search/filtering

**Preconditions**
- User is on Schedule Scan

**Steps**
1. Select one state
2. Review displayed centers
3. Switch to another state
4. Review displayed centers again

**Expected Result**
- Only centers from the selected state are shown
- Switching state updates the list correctly

---

## 8. TC-08 — Selected location, date, and slots persist into Step 3
**Priority:** P1  
**Type:** State persistence

**Preconditions**
- User completes Step 2

**Steps**
1. Select a location
2. Select 3 time slots
3. Continue to payment

**Expected Result**
- Payment page shows the correct location and selected time slots
- No chosen values are lost between steps

---

## 9. TC-09 — Back navigation preserves previously entered data
**Priority:** P1  
**Type:** UX / state management

**Preconditions**
- User has progressed through at least Step 2

**Steps**
1. Complete Step 1
2. Make selections on Step 2
3. Navigate back to Step 1
4. Return forward again

**Expected Result**
- Previously entered DOB, sex, scan, location, and selected slots remain intact where expected

---

## 10. TC-10 — Payment retry with valid card succeeds after a declined attempt
**Priority:** P1  
**Type:** Recovery / payment resilience

**Preconditions**
- User is on payment page
- Declined and valid test cards are available

**Steps**
1. Submit a declined card
2. Verify the error state
3. Enter a valid card without restarting the flow
4. Submit again

**Expected Result**
- Retry succeeds
- User reaches confirmation
- Prior decline does not permanently block the flow

---

## 11. TC-11 — Incomplete card details prevent payment submission
**Priority:** P2  
**Type:** Payment field validation

**Preconditions**
- User is on Reserve Appointment

**Steps**
1. Enter partial card number or invalid expiry/CVC/ZIP
2. Attempt to continue

**Expected Result**
- Payment submission is blocked or field-level validation appears
- User cannot complete booking with incomplete card details

---

## 12. TC-12 — Expired card is rejected clearly
**Priority:** P2  
**Type:** Negative / payment validation

**Preconditions**
- User is on Reserve Appointment

**Steps**
1. Enter a valid card number with expired expiry date
2. Submit payment

**Expected Result**
- Payment is rejected with a clear, user-friendly error
- User remains on the payment page

---

## 13. TC-13 — Promo code application updates total correctly
**Priority:** P2  
**Type:** Price calculation

**Preconditions**
- Valid and invalid promo codes are available

**Steps**
1. Enter a valid promo code
2. Apply the code
3. Verify updated total
4. Repeat with an invalid code

**Expected Result**
- Valid code updates the total correctly
- Invalid code shows an error and leaves total unchanged

---

## 14. TC-14 — Alternative center / scan substitution messaging is accurate
**Priority:** P3  
**Type:** Edge case / product mapping

**Preconditions**
- A center exists that offers an alternative scan option

**Steps**
1. Start with one scan type selected
2. Choose a center labeled as offering an alternative
3. Continue to payment

**Expected Result**
- The payment summary reflects the actual scan product being booked
- Price and messaging match the substituted offering

---

## 15. TC-15 — Confirmation page reflects the exact booking that was submitted
**Priority:** P3  
**Type:** Confirmation / post-submit integrity

**Preconditions**
- Booking completed successfully

**Steps**
1. Finish the full flow successfully
2. Review the confirmation page

**Expected Result**
- Confirmation page shows the correct scan type, location, date context, and selected time slots
- Next-step actions are visible and usable

---

## Notes
- This ordering prioritizes business-critical risk first: successful conversion, payment handling, and core scheduling validation.
- Lower-ranked tests are still valuable, but they are less likely to fully block revenue or operational booking success.
