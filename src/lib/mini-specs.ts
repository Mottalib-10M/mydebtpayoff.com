/** Mini-simulateurs des guides (RECETTE §9.3), calculés par le moteur de remboursement de dettes. */
import { calculatePayoffSchedule, calculateTotalInterest, calculatePayoffMonths, compareStrategies, calculateMonthlyPayment, type Debt } from './engine';
import type { MiniSpec } from './mini-types';

const usd = (x: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(x));
const pct = (x: number) => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(x)} %`;
const dur = (m: number) => m >= 600 ? 'never at this payment' : `${Math.floor(m / 12) ? `${Math.floor(m / 12)} yr ` : ''}${m % 12} mo`;
const bal = (def = 5000) => ({ id: 'b', label: 'Balance', def, unit: '$', max: 5000000 });
const apr = (def = 22.99, label = 'APR') => ({ id: 'r', label, def, unit: '%', max: 99, decimals: 2 });
const pay = (def = 200) => ({ id: 'p', label: 'Monthly payment', def, unit: '$', max: 1000000 });
const one = (b: number, r: number, p: number): Debt[] => [{ name: 'Debt', balance: b, apr: r, minimumPayment: p }];
const run = (b: number, r: number, p: number, extra = 0) => { const s = calculatePayoffSchedule(one(b, r, p), extra, 'avalanche'); const m = calculatePayoffMonths(s); return { months: p <= b * r / 1200 && extra <= 0 ? 600 : m, interest: calculateTotalInterest(s) }; };

const SPECS: Record<string, MiniSpec> = {
  payoff: { title: 'How long until this debt is gone?', cta: 'Full debt payoff calculator', inputs: [bal(), apr(), pay()], run: ({ b, r, p }) => {
    const x = run(b, r, p); return { head: ['Time to pay off', dur(x.months)], rows: [['Total interest', x.months >= 600 ? '–' : usd(x.interest)], ['Interest in the first month', usd(b * r / 1200)]] };
  } },
  card: { title: 'Your credit card payoff, and what $100 more changes', cta: 'Full debt payoff calculator', inputs: [bal(), apr(), pay()], run: ({ b, r, p }) => {
    const x = run(b, r, p); const y = run(b, r, p + 100); return { head: ['Time to pay off', dur(x.months)], rows: [['Total interest', x.months >= 600 ? '–' : usd(x.interest)], ['With $100 more a month', `${dur(y.months)}, ${usd(y.interest)} interest`]] };
  } },
  compare: { title: 'Avalanche or snowball on your debts', cta: 'Compare both strategies', inputs: [{ id: 'e', label: 'Extra payment per month', def: 150, unit: '$', max: 100000 }], run: ({ e }) => {
    const debts: Debt[] = [{ name: 'Card', balance: 6000, apr: 24.99, minimumPayment: 180 }, { name: 'Store card', balance: 1200, apr: 18.99, minimumPayment: 40 }, { name: 'Car loan', balance: 9000, apr: 7.5, minimumPayment: 250 }];
    const c = compareStrategies(debts, e); return { head: ['Interest saved by the avalanche', usd(c.interestSaved)], rows: [['Avalanche: debt-free in', dur(c.avalanche.payoffMonths)], ['Snowball: debt-free in', dur(c.snowball.payoffMonths)], ['Example debts', '$6,000 at 25 %, $1,200 at 19 %, $9,000 at 7.5 %']] };
  } },
  consolidation: { title: 'Does a consolidation loan save you money?', cta: 'Full debt payoff calculator', inputs: [bal(15000), apr(22.99, 'Current APR'), { id: 'n', label: 'Consolidation loan APR', def: 11.5, unit: '%', max: 99, decimals: 2 }, { id: 't', label: 'Loan term in months', def: 48, unit: 'mo', max: 360 }], run: ({ b, r, n, t }) => {
    const pm = calculateMonthlyPayment(b, n, t); const loanInterest = pm * t - b; const cur = run(b, r, pm);
    return { head: ['Interest saved', usd(Math.max(0, cur.interest - loanInterest))], rows: [['Loan payment per month', usd(pm)], ['Interest on the loan', usd(loanInterest)], ['Same payment at the current APR', cur.months >= 600 ? 'never paid off' : `${usd(cur.interest)} interest`]] };
  } },
  extra: { title: 'What an extra payment does', cta: 'Full debt payoff calculator', inputs: [bal(12000), apr(19.99), pay(300), { id: 'e', label: 'Extra per month', def: 100, unit: '$', max: 100000 }], run: ({ b, r, p, e }) => {
    const x = run(b, r, p); const y = run(b, r, p + e); return { head: ['Months saved', x.months >= 600 ? '–' : String(x.months - y.months)], rows: [['Interest saved', x.months >= 600 ? '–' : usd(x.interest - y.interest)], ['Debt-free in', dur(y.months)]] };
  } },
  emergency: { title: 'The cost of keeping cash while you owe', cta: 'Full debt payoff calculator', inputs: [{ id: 'f', label: 'Emergency fund', def: 2000, unit: '$', max: 1000000 }, apr(22.99, 'APR on your debt'), { id: 's', label: 'Savings account rate', def: 4, unit: '%', max: 20, decimals: 2 }], run: ({ f, r, s }) => {
    const cost = f * (r - s) / 100; return { head: ['Net cost per year', usd(cost)], rows: [['Interest the fund would save on the debt', usd(f * r / 100)], ['Interest the fund earns', usd(f * s / 100)]], note: 'The price of insurance against a new debt when something breaks.' };
  } },
  negotiate: { title: 'What a lower rate is worth', cta: 'Full debt payoff calculator', inputs: [bal(), apr(24.99), { id: 'n', label: 'Negotiated APR', def: 19.99, unit: '%', max: 99, decimals: 2 }, pay()], run: ({ b, r, n, p }) => {
    const x = run(b, r, p); const y = run(b, n, p); return { head: ['Interest saved', x.months >= 600 ? '–' : usd(x.interest - y.interest)], rows: [['Months saved', x.months >= 600 ? '–' : String(x.months - y.months)], ['Rate cut', `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(r - n)} percentage points`]] };
  } },
  student: { title: 'Your student loan payment', cta: 'Full debt payoff calculator', inputs: [bal(35000), apr(6.53, 'Interest rate'), { id: 't', label: 'Repayment term in years', def: 10, unit: 'yrs', max: 30 }], run: ({ b, r, t }) => {
    const pm = calculateMonthlyPayment(b, r, t * 12); return { head: ['Monthly payment', usd(pm)], rows: [['Total interest', usd(pm * t * 12 - b)], ['Total repaid', usd(pm * t * 12)]] };
  } },
};

export function getSpec(kind: string, _lang?: string): MiniSpec {
  const s = SPECS[kind]; if (!s) throw new Error(`Mini-simulateur inconnu : ${kind}`); return s;
}
