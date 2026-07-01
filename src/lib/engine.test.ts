import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculatePayoffSchedule,
  calculateTotalInterest,
  calculatePayoffMonths,
  compareStrategies,
  calculateLoanAmortization,
  type Debt,
} from './engine';

describe('calculateMonthlyPayment', () => {
  it('should calculate a known monthly payment correctly', () => {
    // $10,000 at 6% APR for 60 months = ~$193.33
    const payment = calculateMonthlyPayment(10000, 6, 60);
    expect(payment).toBeCloseTo(193.33, 0);
  });

  it('should return 0 for zero principal', () => {
    expect(calculateMonthlyPayment(0, 5, 12)).toBe(0);
  });

  it('should return 0 for zero months', () => {
    expect(calculateMonthlyPayment(1000, 5, 0)).toBe(0);
  });

  it('should handle zero APR as simple division', () => {
    const payment = calculateMonthlyPayment(1200, 0, 12);
    expect(payment).toBe(100);
  });
});

describe('calculatePayoffSchedule', () => {
  const singleDebt: Debt[] = [
    { name: 'Credit Card', balance: 5000, apr: 18.99, minimumPayment: 100 },
  ];

  it('should pay off a single debt with minimum payment only', () => {
    const schedule = calculatePayoffSchedule(singleDebt, 0, 'avalanche');
    expect(schedule.length).toBeGreaterThan(0);
    const lastMonth = schedule[schedule.length - 1];
    expect(lastMonth.totalRemainingBalance).toBe(0);
  });

  it('should pay off faster with extra payment', () => {
    const scheduleMinOnly = calculatePayoffSchedule(singleDebt, 0, 'avalanche');
    const scheduleExtra = calculatePayoffSchedule(singleDebt, 200, 'avalanche');
    expect(scheduleExtra.length).toBeLessThan(scheduleMinOnly.length);
  });

  it('should reduce total interest with extra payment', () => {
    const scheduleMinOnly = calculatePayoffSchedule(singleDebt, 0, 'avalanche');
    const scheduleExtra = calculatePayoffSchedule(singleDebt, 200, 'avalanche');
    const interestMin = calculateTotalInterest(scheduleMinOnly);
    const interestExtra = calculateTotalInterest(scheduleExtra);
    expect(interestExtra).toBeLessThan(interestMin);
  });

  it('should handle empty debts array', () => {
    const schedule = calculatePayoffSchedule([], 100, 'avalanche');
    expect(schedule).toEqual([]);
  });

  it('should handle zero balance debt', () => {
    const zeroDebt: Debt[] = [
      { name: 'Paid Off', balance: 0, apr: 15, minimumPayment: 50 },
    ];
    const schedule = calculatePayoffSchedule(zeroDebt, 0, 'avalanche');
    expect(schedule.length).toBe(0);
  });
});

describe('avalanche vs snowball', () => {
  const multipleDebts: Debt[] = [
    { name: 'Credit Card A', balance: 3000, apr: 22.99, minimumPayment: 60 },
    { name: 'Credit Card B', balance: 8000, apr: 15.99, minimumPayment: 160 },
    { name: 'Personal Loan', balance: 5000, apr: 9.99, minimumPayment: 100 },
  ];

  it('should produce different schedules for avalanche and snowball', () => {
    const avalanche = calculatePayoffSchedule(multipleDebts, 100, 'avalanche');
    const snowball = calculatePayoffSchedule(multipleDebts, 100, 'snowball');
    // They might have different lengths or interest amounts
    const intAvalanche = calculateTotalInterest(avalanche);
    const intSnowball = calculateTotalInterest(snowball);
    // Avalanche should save on interest (or equal)
    expect(intAvalanche).toBeLessThanOrEqual(intSnowball);
  });

  it('avalanche targets highest APR debt first for extra payment', () => {
    const schedule = calculatePayoffSchedule(multipleDebts, 100, 'avalanche');
    // In month 1, Credit Card A (22.99%) should get the extra payment
    const month1 = schedule[0];
    const ccA = month1.debts.find((d) => d.name === 'Credit Card A')!;
    // ccA payment should exceed its minimum (60 + extra)
    expect(ccA.payment).toBeGreaterThan(60);
  });

  it('snowball targets lowest balance debt first for extra payment', () => {
    const schedule = calculatePayoffSchedule(multipleDebts, 100, 'snowball');
    // Credit Card A ($3000) is lowest balance, should get extra
    const month1 = schedule[0];
    const ccA = month1.debts.find((d) => d.name === 'Credit Card A')!;
    expect(ccA.payment).toBeGreaterThan(60);
  });
});

describe('calculateTotalInterest', () => {
  it('should sum all interest from schedule', () => {
    const debt: Debt[] = [
      { name: 'Loan', balance: 2000, apr: 12, minimumPayment: 200 },
    ];
    const schedule = calculatePayoffSchedule(debt, 0, 'avalanche');
    const totalInterest = calculateTotalInterest(schedule);
    expect(totalInterest).toBeGreaterThan(0);
  });
});

describe('calculatePayoffMonths', () => {
  it('should return correct number of months', () => {
    const debt: Debt[] = [
      { name: 'Loan', balance: 1000, apr: 0, minimumPayment: 500 },
    ];
    const schedule = calculatePayoffSchedule(debt, 0, 'avalanche');
    expect(calculatePayoffMonths(schedule)).toBe(2);
  });

  it('should return 0 for empty schedule', () => {
    expect(calculatePayoffMonths([])).toBe(0);
  });
});

describe('compareStrategies', () => {
  it('should return both strategies and comparison metrics', () => {
    const debts: Debt[] = [
      { name: 'Card A', balance: 4000, apr: 24.99, minimumPayment: 80 },
      { name: 'Card B', balance: 2000, apr: 14.99, minimumPayment: 40 },
    ];
    const comparison = compareStrategies(debts, 100);
    expect(comparison.avalanche.strategy).toBe('avalanche');
    expect(comparison.snowball.strategy).toBe('snowball');
    expect(comparison.interestSaved).toBeGreaterThanOrEqual(0);
    expect(typeof comparison.monthsDifference).toBe('number');
  });
});

describe('calculateLoanAmortization', () => {
  it('should produce correct number of rows', () => {
    const table = calculateLoanAmortization(10000, 5, 36);
    expect(table.length).toBe(36);
  });

  it('should end with zero remaining balance', () => {
    const table = calculateLoanAmortization(10000, 5, 36);
    expect(table[table.length - 1].remainingBalance).toBe(0);
  });

  it('total principal paid should approximate original principal', () => {
    const table = calculateLoanAmortization(10000, 6, 60);
    const totalPrincipal = table.reduce((sum, row) => sum + row.principal, 0);
    expect(totalPrincipal).toBeCloseTo(10000, 0);
  });

  it('should return empty array for zero principal', () => {
    expect(calculateLoanAmortization(0, 5, 12)).toEqual([]);
  });
});
