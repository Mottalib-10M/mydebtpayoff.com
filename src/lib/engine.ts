// ── Types ──────────────────────────────────────────────────────────────────────

export interface Debt {
  name: string;
  balance: number;
  apr: number; // as a percentage, e.g. 18.99
  minimumPayment: number;
}

export type PayoffStrategy = 'avalanche' | 'snowball';

export interface MonthlyDebtDetail {
  name: string;
  startingBalance: number;
  payment: number;
  interestPaid: number;
  principalPaid: number;
  endingBalance: number;
}

export interface MonthlySnapshot {
  month: number;
  debts: MonthlyDebtDetail[];
  totalPayment: number;
  totalInterest: number;
  totalPrincipal: number;
  totalRemainingBalance: number;
}

export interface PayoffResult {
  strategy: PayoffStrategy;
  schedule: MonthlySnapshot[];
  totalInterestPaid: number;
  totalAmountPaid: number;
  payoffMonths: number;
}

export interface StrategyComparison {
  avalanche: PayoffResult;
  snowball: PayoffResult;
  interestSaved: number;
  monthsDifference: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

// ── Core Functions ─────────────────────────────────────────────────────────────

/**
 * Standard amortization formula for fixed monthly payment.
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(
  principal: number,
  apr: number,
  months: number
): number {
  if (principal <= 0) return 0;
  if (months <= 0) return 0;
  if (apr <= 0) return principal / months;

  const monthlyRate = apr / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  const payment = principal * (monthlyRate * factor) / (factor - 1);
  return Math.round(payment * 100) / 100;
}

/**
 * Month-by-month payoff schedule for multiple debts with extra payments.
 */
export function calculatePayoffSchedule(
  debts: Debt[],
  extraPayment: number,
  strategy: PayoffStrategy
): MonthlySnapshot[] {
  if (debts.length === 0) return [];

  // Deep clone balances
  const balances = debts.map((d) => Math.max(0, d.balance));
  const schedule: MonthlySnapshot[] = [];
  const MAX_MONTHS = 600; // 50 years safety cap

  let month = 0;

  while (balances.some((b) => b > 0.005) && month < MAX_MONTHS) {
    month++;

    // Determine priority order for extra payment
    const activeIndices = balances
      .map((b, i) => (b > 0.005 ? i : -1))
      .filter((i) => i >= 0);

    if (activeIndices.length === 0) break;

    let sortedIndices: number[];
    if (strategy === 'avalanche') {
      // Highest APR first
      sortedIndices = [...activeIndices].sort(
        (a, b) => debts[b].apr - debts[a].apr
      );
    } else {
      // Lowest balance first
      sortedIndices = [...activeIndices].sort(
        (a, b) => balances[a] - balances[b]
      );
    }

    const monthDetails: MonthlyDebtDetail[] = [];
    let extraRemaining = extraPayment;

    // First pass: calculate interest and pay minimums
    const interestAmounts: number[] = [];
    const minPayments: number[] = [];

    for (let i = 0; i < debts.length; i++) {
      if (balances[i] <= 0.005) {
        interestAmounts.push(0);
        minPayments.push(0);
        continue;
      }
      const monthlyRate = debts[i].apr / 100 / 12;
      const interest = Math.round(balances[i] * monthlyRate * 100) / 100;
      interestAmounts.push(interest);

      // Minimum payment: at least interest, capped by balance + interest
      const minPay = Math.min(
        debts[i].minimumPayment,
        balances[i] + interest
      );
      minPayments.push(minPay);
    }

    // Track payments per debt
    const payments = [...minPayments];

    // Second pass: distribute extra payment in priority order
    for (const idx of sortedIndices) {
      if (extraRemaining <= 0) break;
      if (balances[idx] <= 0.005) continue;

      const maxExtra =
        balances[idx] + interestAmounts[idx] - payments[idx];
      if (maxExtra <= 0) continue;

      const applied = Math.min(extraRemaining, maxExtra);
      payments[idx] += applied;
      extraRemaining -= applied;
    }

    // Build month details
    let totalPayment = 0;
    let totalInterest = 0;
    let totalPrincipal = 0;
    let totalRemaining = 0;

    for (let i = 0; i < debts.length; i++) {
      const startBal = balances[i];
      const interest = interestAmounts[i];
      const payment = payments[i];
      const principal = payment - interest;
      balances[i] = Math.max(0, startBal - principal);

      monthDetails.push({
        name: debts[i].name,
        startingBalance: Math.round(startBal * 100) / 100,
        payment: Math.round(payment * 100) / 100,
        interestPaid: Math.round(interest * 100) / 100,
        principalPaid: Math.round(principal * 100) / 100,
        endingBalance: Math.round(balances[i] * 100) / 100,
      });

      totalPayment += payment;
      totalInterest += interest;
      totalPrincipal += principal;
      totalRemaining += balances[i];
    }

    schedule.push({
      month,
      debts: monthDetails,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPrincipal: Math.round(totalPrincipal * 100) / 100,
      totalRemainingBalance: Math.round(totalRemaining * 100) / 100,
    });
  }

  return schedule;
}

/**
 * Sum all interest paid across the schedule.
 */
export function calculateTotalInterest(schedule: MonthlySnapshot[]): number {
  const total = schedule.reduce((sum, snap) => sum + snap.totalInterest, 0);
  return Math.round(total * 100) / 100;
}

/**
 * Number of months until all debts are paid off.
 */
export function calculatePayoffMonths(schedule: MonthlySnapshot[]): number {
  if (schedule.length === 0) return 0;
  return schedule[schedule.length - 1].month;
}

/**
 * Build a full PayoffResult for a given strategy.
 */
function buildPayoffResult(
  debts: Debt[],
  extraPayment: number,
  strategy: PayoffStrategy
): PayoffResult {
  const schedule = calculatePayoffSchedule(debts, extraPayment, strategy);
  const totalInterestPaid = calculateTotalInterest(schedule);
  const totalAmountPaid = schedule.reduce(
    (sum, snap) => sum + snap.totalPayment,
    0
  );
  return {
    strategy,
    schedule,
    totalInterestPaid,
    totalAmountPaid: Math.round(totalAmountPaid * 100) / 100,
    payoffMonths: calculatePayoffMonths(schedule),
  };
}

/**
 * Compare avalanche vs snowball strategies side by side.
 */
export function compareStrategies(
  debts: Debt[],
  extraPayment: number
): StrategyComparison {
  const avalanche = buildPayoffResult(debts, extraPayment, 'avalanche');
  const snowball = buildPayoffResult(debts, extraPayment, 'snowball');

  return {
    avalanche,
    snowball,
    interestSaved: Math.round(
      (snowball.totalInterestPaid - avalanche.totalInterestPaid) * 100
    ) / 100,
    monthsDifference: snowball.payoffMonths - avalanche.payoffMonths,
  };
}

/**
 * Full amortization table for a single loan.
 */
export function calculateLoanAmortization(
  principal: number,
  apr: number,
  months: number
): AmortizationRow[] {
  if (principal <= 0 || months <= 0) return [];

  const payment = calculateMonthlyPayment(principal, apr, months);
  const monthlyRate = apr / 100 / 12;
  const table: AmortizationRow[] = [];
  let remaining = principal;

  for (let m = 1; m <= months; m++) {
    const interest = Math.round(remaining * monthlyRate * 100) / 100;
    const principalPaid = Math.min(
      Math.round((payment - interest) * 100) / 100,
      remaining
    );
    remaining = Math.max(
      0,
      Math.round((remaining - principalPaid) * 100) / 100
    );

    // Last month adjustment: pay off any remaining rounding difference
    if (m === months && remaining > 0) {
      const adjustedPrincipal = principalPaid + remaining;
      table.push({
        month: m,
        payment: Math.round((interest + adjustedPrincipal) * 100) / 100,
        principal: Math.round(adjustedPrincipal * 100) / 100,
        interest,
        remainingBalance: 0,
      });
    } else {
      table.push({
        month: m,
        payment: Math.round(payment * 100) / 100,
        principal: principalPaid,
        interest,
        remainingBalance: remaining,
      });
    }
  }

  return table;
}
