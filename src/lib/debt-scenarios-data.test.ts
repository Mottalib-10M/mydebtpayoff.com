import { describe, it, expect } from 'vitest';
import { compareStrategies, calculatePayoffSchedule } from './engine';
import { debtScenarios } from './debt-scenarios-data';

/*
 * Les pages par montant citent leurs chiffres (mois, interets, ecart entre
 * methodes) et le calculateur s'ouvre sur le meme scenario : les deux doivent
 * dire la meme chose. Les anciens chiffres avaient ete ecrits a la main et ne
 * correspondaient pas au moteur (2026-10-12).
 */
describe('scenarios par montant = moteur', () => {
  for (const s of debtScenarios) {
    it(`${s.slug} : timeline conforme au calcul`, () => {
      const total = s.typicalDebts.reduce((a, d) => a + d.balance, 0);
      expect(total).toBe(s.amount);
      const c = compareStrategies(s.typicalDebts, s.timeline.extraPayment);
      expect(c.avalanche.payoffMonths).toBe(s.timeline.avalancheMonths);
      expect(c.snowball.payoffMonths).toBe(s.timeline.snowballMonths);
      expect(Math.round(c.avalanche.totalInterestPaid)).toBe(s.timeline.avalancheInterest);
      expect(Math.round(c.snowball.totalInterestPaid)).toBe(s.timeline.snowballInterest);
      expect(Math.round(c.interestSaved)).toBe(s.timeline.interestSaved);
      expect(c.monthsDifference).toBe(s.timeline.monthsSaved);
    });
  }
});

describe('rollover', () => {
  it('le minimum d une dette soldee passe a la suivante', () => {
    const debts = [
      { name: 'A', balance: 500, apr: 0, minimumPayment: 100 },
      { name: 'B', balance: 5000, apr: 10, minimumPayment: 100 },
    ];
    const sched = calculatePayoffSchedule(debts, 0, 'avalanche');
    const apres = sched[8];
    expect(apres.totalPayment).toBeCloseTo(200, 2);
  });
});
