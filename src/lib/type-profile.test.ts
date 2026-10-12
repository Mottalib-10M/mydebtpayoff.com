import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compareStrategies } from './engine';
import { debtTypes } from './debt-types-data';
import { profilType } from './type-profile';

const usd = (v: number) => '$' + Math.round(v).toLocaleString('en-US');
const dist = join(process.cwd(), 'dist');

/* Pages par type : les chiffres du bloc « Where the money actually goes » = moteur (2026-10-12). */
describe('pages par type de dette : chiffres affiches = moteur', () => {
  for (const e of debtTypes) {
    it(`${e.slug} : profil calcule par le moteur`, () => {
      const p = profilType(e);
      const c = compareStrategies(p.dettes, p.supplement);
      expect(p.mois).toBe(c.avalanche.payoffMonths);
      expect(p.mois).toBeLessThan(600); // le plan se termine (pas de plafond de 50 ans)
      expect(p.interets).toBe(Math.round(c.avalanche.totalInterestPaid));
      expect(p.interetsAutreMethode).toBe(Math.round(c.snowball.totalInterestPaid));
    });
    // Apres un build (npm run build), le HTML publie doit porter ces memes chiffres.
    const page = join(dist, `${e.slug}-payoff`, 'index.html');
    it.skipIf(!existsSync(page))(`${e.slug} : HTML construit conforme`, () => {
      const p = profilType(e);
      const txt = readFileSync(page, 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/ /g, ' ');
      expect(txt).toContain(`timeline to ${p.mois} months`);
      expect(txt).toContain(`${usd(p.interets)} of interest`);
      const ecart = Math.abs(p.interets - p.interetsAutreMethode);
      if (ecart >= 1) {
        expect(txt).toContain(`worth ${usd(ecart)} against`);
      } else {
        // Ecart nul : la section « Why the order of payment matters here » n'est pas rendue.
        expect(txt).not.toContain('against the snowball order');
        expect(txt).not.toContain('Whether $0 justifies');
        expect(txt).not.toContain('Why the order of payment matters here');
      }
    });
  }
});

/* Pages par montant : l'ecart est toujours positif, la section reste rendue. */
import { debtScenarios } from './debt-scenarios-data';
describe('pages par montant : section de l ordre rendue quand l ecart > 0', () => {
  for (const sc of debtScenarios) {
    const page = join(dist, `payoff-${sc.slug}`, 'index.html');
    it.skipIf(!existsSync(page))(`${sc.slug}`, () => {
      const ecart = Math.abs(sc.timeline.avalancheInterest - sc.timeline.snowballInterest);
      expect(ecart).toBeGreaterThan(0);
      const txt = readFileSync(page, 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/\u00a0/g, ' ');
      expect(txt).toContain('Why the order of payment matters here');
      expect(txt).toContain(`worth ${usd(ecart)} against`);
    });
  }
});
