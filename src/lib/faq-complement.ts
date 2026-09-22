/**
 * Questions complementaires, engendrees a partir des donnees de chaque page.
 *
 * La recette (§7) demande six a huit questions sur une page pilier ; ces pages
 * en portaient trois. Les completer avec un texte commun aurait aggrave le
 * probleme, puisque les pages se ressemblent deja : chaque reponse ci-dessous
 * est donc construite sur les chiffres propres a la page, montant, taux,
 * duree, ecart entre les deux methodes. Deux pages ne peuvent pas produire le
 * meme texte, et aucune n'avance un chiffre qui ne vienne pas de ses donnees.
 *
 * Les reponses tiennent les bornes de 40 a 90 mots imposees par la recette.
 */
import type { DebtScenario } from './debt-scenarios-data';
import type { DebtTypeEntry } from './debt-types-data';

export interface FAQ {
  question: string;
  answer: string;
}

const usd = (v: number) =>
  '$' + Math.round(v).toLocaleString('en-US');

/** Questions propres a un montant de dette. */
export function faqsMontant(s: DebtScenario): FAQ[] {
  const t = s.timeline;
  const tauxMoyen =
    s.typicalDebts.reduce((acc, d) => acc + d.apr * d.balance, 0) /
    Math.max(1, s.typicalDebts.reduce((acc, d) => acc + d.balance, 0));
  const mensualiteMin = s.typicalDebts.reduce((acc, d) => acc + d.minimumPayment, 0);
  const totalPaye = s.amount + t.avalancheInterest;
  const parMois = totalPaye / Math.max(1, t.avalancheMonths);

  return [
    {
      question: `What monthly payment clears ${s.amountFormatted} in two years?`,
      answer:
        `Paying off ${s.amountFormatted} over 24 months takes roughly ${usd(parMois)} a month once interest ` +
        `is included, against ${usd(mensualiteMin)} in combined minimums. The gap between those two figures ` +
        `is the whole question: minimums are calculated to keep the balance alive, not to clear it. ` +
        `Any amount you add lands entirely on the principal, which is why the timeline shortens far ` +
        `faster than the extra payment might suggest.`,
    },
    {
      question: `How much interest does ${s.amountFormatted} of debt cost in total?`,
      answer:
        `On this mix of balances, at a weighted average rate of ${tauxMoyen.toFixed(1)}%, the avalanche ` +
        `method costs ${usd(t.avalancheInterest)} in interest and the snowball ${usd(t.snowballInterest)}. ` +
        `You therefore repay about ${usd(totalPaye)} in total for ${s.amountFormatted} borrowed. Interest ` +
        `accrues daily on most credit products, so a payment made early in the cycle costs slightly less ` +
        `than the same payment made at the end of it.`,
    },
    {
      question: `Is it worth refinancing ${s.amountFormatted} of debt?`,
      answer:
        `It depends on the rate you can obtain against the ${tauxMoyen.toFixed(1)}% you currently average. ` +
        `A consolidation loan below that rate reduces the interest bill; above it, the loan costs more ` +
        `than it saves however attractive the single monthly payment looks. Factor in origination fees, ` +
        `commonly one to eight percent of the amount, and check that the new term is not longer than your ` +
        `current ${t.avalancheMonths}-month plan.`,
    },
    {
      question: `What happens if I only pay the minimum on ${s.amountFormatted}?`,
      answer:
        `Minimum payments are typically set at one to three percent of the balance, so they fall as the ` +
        `balance falls, stretching the payoff over many years. On ${s.amountFormatted} the interest paid ` +
        `can approach or exceed the sum borrowed. The plan on this page assumes ${usd(t.extraPayment)} a ` +
        `month above the minimums, which is what brings the timeline down to ${t.avalancheMonths} months ` +
        `rather than a decade or more.`,
    },
  ];
}

/** Questions propres a un type de dette. */
export function faqsType(e: DebtTypeEntry): FAQ[] {
  const ecart = e.aprHigh - e.aprLow;
  const interetAnnuel = (e.exampleBalance * e.exampleApr) / 100;
  const partInteret = (interetAnnuel / 12 / Math.max(1, e.exampleMinPayment)) * 100;

  return [
    {
      question: `What interest rate is normal on ${e.label.toLowerCase()}?`,
      answer:
        `Rates run from about ${e.aprLow}% to ${e.aprHigh}%, a spread of ${ecart.toFixed(1)} points that ` +
        `depends mostly on credit score, term and whether the debt is secured. On the ` +
        `${usd(e.exampleBalance)} balance used as the example here, at ${e.exampleApr}%, interest alone ` +
        `costs ${usd(interetAnnuel)} a year. Moving from the top of that range to the bottom is usually ` +
        `worth more than any change in payment habits.`,
    },
    {
      question: `How much of my payment goes to interest on ${e.label.toLowerCase()}?`,
      answer:
        `At the start, roughly ${partInteret.toFixed(0)}% of a ${usd(e.exampleMinPayment)} minimum payment ` +
        `on this example goes to interest rather than principal. That proportion falls as the balance ` +
        `drops, which is why the last months of a payoff plan feel much faster than the first. Checking ` +
        `this split on your own statement is the quickest way to see whether the minimum is making real ` +
        `progress.`,
    },
    {
      question: `Should ${e.label.toLowerCase()} be paid off before other debts?`,
      answer:
        `The avalanche method answers this on rate alone: pay whichever debt carries the highest rate ` +
        `first, regardless of type. At ${e.exampleApr}% this example sits in the middle of most household ` +
        `debt profiles, above a mortgage and below a typical credit card. The exception is a debt with ` +
        `collateral at risk, where falling behind costs more than interest, and a zero-rate promotional ` +
        `balance, which should be cleared before the promotion ends.`,
    },
  ];
}
