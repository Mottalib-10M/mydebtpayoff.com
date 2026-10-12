/**
 * Profil chiffre des pages par type de dette (bloc PayoffMechanics).
 *
 * Le bloc recevait des approximations (solde x taux x 1,6 pour les interets,
 * 36 mois fixes) qui ne sortaient d'aucun calcul. Les mois et les interets
 * viennent desormais du moteur, sur le profil decrit par la page
 * (2026-10-12).
 */
import { compareStrategies, type Debt } from './engine';
import type { DebtTypeEntry } from './debt-types-data';

export interface TypeProfile {
  dettes: Debt[];
  supplement: number;
  mois: number;
  interets: number;
  interetsAutreMethode: number;
}

export function profilType(e: DebtTypeEntry): TypeProfile {
  const dettes: Debt[] = [
    { name: e.label, balance: e.exampleBalance, apr: e.exampleApr, minimumPayment: e.exampleMinPayment },
    { name: 'Credit card', balance: Math.round(e.exampleBalance * 0.25), apr: 22.99, minimumPayment: Math.round(e.exampleBalance * 0.25 * 0.02) },
  ];
  const supplement = Math.max(50, Math.round(e.exampleMinPayment * 0.4));
  const c = compareStrategies(dettes, supplement);
  return {
    dettes,
    supplement,
    mois: c.avalanche.payoffMonths,
    interets: Math.round(c.avalanche.totalInterestPaid),
    interetsAutreMethode: Math.round(c.snowball.totalInterestPaid),
  };
}
