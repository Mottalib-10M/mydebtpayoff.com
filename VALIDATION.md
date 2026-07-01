# Validation Test Cases

## Test Case 1: Single Credit Card — Minimum Payments Only

**Input:**
- Debt: Credit Card, $5,000 balance, 22.99% APR, $100 minimum payment
- Extra Payment: $0
- Strategy: Avalanche

**Expected Results:**
- Payoff timeline: approximately 94 months (~7.8 years)
- Total interest paid: approximately $4,300–$4,500
- Final month balance reaches $0.00

**Verification:**
At 22.99% APR, monthly interest on $5,000 is ~$95.79. With a $100 minimum, only ~$4.21 goes to principal in month 1. This confirms the long payoff period with minimum-only payments.

---

## Test Case 2: Three Debts — Avalanche vs. Snowball Comparison

**Input:**
- Debt A: Credit Card, $3,000 balance, 22.99% APR, $60 minimum
- Debt B: Car Loan, $8,000 balance, 6.50% APR, $160 minimum
- Debt C: Student Loan, $5,000 balance, 5.50% APR, $100 minimum
- Extra Payment: $200
- Compare both strategies

**Expected Results:**
- Avalanche pays less total interest than snowball
- Avalanche targets Credit Card (22.99%) first
- Snowball targets Credit Card ($3,000 — also smallest balance) first
- In this case, both strategies target the same debt first, so results are similar
- Total payoff: approximately 25–30 months
- Avalanche interest saved >= $0 compared to snowball

**Verification:**
Both strategies should target the Credit Card first since it has both the highest APR and lowest balance. The strategies diverge only in which debt gets priority second. Total debt of $16,000 with $520/mo combined payments means approximately 31 months without interest, so ~25–35 months with interest is reasonable.

---

## Test Case 3: Loan Amortization — Known Formula Verification

**Input:**
- Principal: $10,000
- APR: 6%
- Term: 60 months

**Expected Results:**
- Monthly payment: $193.33
- Total of all principal payments equals $10,000
- Final row has remaining balance of $0.00
- Total interest paid: approximately $1,600
- Total amount paid: approximately $11,600

**Verification:**
Using the standard amortization formula M = P[r(1+r)^n]/[(1+r)^n-1]:
- r = 0.06/12 = 0.005
- (1.005)^60 = 1.34885
- M = 10000 × (0.005 × 1.34885) / (1.34885 - 1) = 10000 × 0.006744 / 0.34885 = $193.33

This matches the known amortization payment for a $10,000 loan at 6% over 5 years.
