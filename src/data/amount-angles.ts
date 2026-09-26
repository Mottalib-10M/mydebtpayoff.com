/**
 * What is specific to one balance and to no other (RECETTE §6).
 *
 * The twelve amount pages were 80 per cent identical, because only the figures
 * changed and the uniqueness check neutralises figures before comparing. Each
 * bracket below is about something that is true at that size and false at the
 * others, and the vocabulary differs on purpose: a passage about balance
 * transfer windows shares almost no words with one about Chapter 13.
 */
export interface Angle { heading: string; paragraphs: string[] }

export const AMOUNT_ANGLES: Record<string, Angle[]> = {
  '5000': [
    { heading: 'A balance this size fits inside one transfer window',
      paragraphs: [
        'Five thousand dollars is the largest balance that a single 0% APR balance transfer card will usually absorb, and that changes the arithmetic completely. A typical promotional period of eighteen months against a transfer fee of three to five per cent means paying roughly two hundred dollars in fee to stop interest entirely, against the eleven hundred or so that the same balance would cost at a standard card rate over the same period. The condition is the one most people miss: the balance has to be cleared before the window closes, because the rate that follows is usually the card\'s standard purchase rate applied to whatever remains.',
        'The payment needed follows directly. Dividing the balance by the number of promotional months gives the figure that has to leave the account each month, and it is that figure, not the minimum, that the plan is built on. Approval also matters: transfer offers are priced for good credit, and an application that is declined has still cost a hard inquiry. Checking pre-qualification first avoids that.',
      ] },
  ],
  '10000': [
    { heading: 'Too large for one card, small enough to clear in two years',
      paragraphs: [
        'At ten thousand dollars, a single transfer card rarely provides enough credit line, which leaves three routes rather than one. Splitting the balance across two promotional cards works but doubles the fees and the deadlines to track. A consolidation loan at a fixed rate converts the debt into a predictable instalment, at the cost of an origination fee taken from the proceeds. Staying put and paying aggressively avoids both fees, and at this size that is often the cheapest answer, because the interest saved by a transfer is smaller than the fees once the balance is spread over two cards.',
        'This is also the level at which the snowball order becomes genuinely attractive. Ten thousand dollars is typically two or three separate balances rather than one, and clearing the smallest of them within two or three months produces a closed account early in the plan, which is the single best predictor of whether the plan is still running a year later.',
      ] },
  ],
  '15000': [
    { heading: 'Personal loan territory, and what the fee really costs',
      paragraphs: [
        'Fifteen thousand dollars is squarely inside the range unsecured personal loans are written for, and comparing one against the existing card debt requires converting the origination fee into rate terms. A fee of five per cent on a three-year loan adds roughly three and a half points to the effective annual cost, which means a loan advertised at eleven per cent behaves like one at fourteen and a half. Against cards at twenty-two, it still wins; against cards at sixteen, it does not.',
        'Two contractual details decide the rest. The term, because a five-year loan with a comfortable payment costs substantially more in total than a three-year loan with a painful one. And whether the lender disburses directly to the card issuers, which removes the temptation that undoes most consolidations: money landing in a checking account tends not to reach the cards in full.',
      ] },
  ],
  '20000': [
    { heading: 'Where utilisation and debt-to-income start to bite',
      paragraphs: [
        'Around twenty thousand dollars of revolving debt, two ratios that lenders watch begin to close doors. Credit utilisation, the share of available limits in use, drives a large part of a credit score, and a balance at this size usually pushes it above the thirty per cent mark at which scoring models start deducting. Debt-to-income, the share of gross monthly income going to debt payments, governs mortgage and refinancing decisions, and the minimum payments on twenty thousand dollars of card debt consume a visible slice of it.',
        'The practical consequence is an ordering that differs from pure interest minimisation: paying down the card closest to its limit improves utilisation faster than paying down the highest-rate card, which matters if a mortgage application or a refinancing is planned within the year. Requesting a limit increase on a card that is not being used has the same effect on utilisation without paying anything, and is worth doing first.',
      ] },
  ],
  '25000': [
    { heading: 'The size at which two kinds of debt usually coexist',
      paragraphs: [
        'A balance of twenty-five thousand dollars is rarely one debt. In most households at this level it is a mix of revolving credit at a high rate and an instalment loan, usually a car, at a much lower one, and the two behave differently under extra payments. Card debt responds immediately, because interest compounds daily and any extra amount reduces the balance the interest is computed on. An instalment loan responds by shortening the term while leaving the monthly payment unchanged, which frees no cash until the loan ends.',
        'That asymmetry decides the order at this size, regardless of which method is preferred: the revolving balance goes first, and not only because its rate is higher. Clearing it also removes a payment that can rise, since minimum payments move with the balance and with rate changes, while an instalment payment is fixed for the life of the contract.',
      ] },
  ],
  '30000': [
    { heading: 'Around the average student loan balance, and what that implies',
      paragraphs: [
        'Thirty thousand dollars sits close to the average student loan balance for a bachelor\'s degree in the United States, which makes one question decisive at this level: whether the debt is federal or private. Federal loans carry income-driven repayment, statutory forgiveness routes, and deferment rights that no calculator should assume away. Extra payments on a federal loan heading for forgiveness reduce a balance that would have been cancelled, which turns a virtue into a loss.',
        'Where the debt is private, or where the plan is standard repayment to the end, the arithmetic is ordinary and extra payments work as they do anywhere. The dividing question therefore comes before the calculation, and the answer is on the servicer\'s statement: a loan serviced under the federal program names the plan it is on. Refinancing a federal loan into a private one settles the matter permanently, by removing the protections.',
      ] },
  ],
  '40000': [
    { heading: 'Choosing between a three-year and a five-year plan',
      paragraphs: [
        'At forty thousand dollars, the difference between a thirty-six month and a sixty-month payoff is no longer academic: it is several thousand dollars of interest and two extra years of constraint. The three-year plan demands a monthly payment most households cannot sustain without changing something structural, usually housing or transport. The five-year plan is affordable and costs substantially more. Between them sits the option that works best in practice, which is a four-year plan with a payment set slightly below the maximum, plus a rule that windfalls go to the balance.',
        'That last rule accounts for more early payoffs at this size than any increase in the monthly amount. Tax refunds, bonuses and the month a car loan ends are lump sums that arrive without any change to the household budget, and directing them at the balance shortens the plan without making any month harder to survive.',
      ] },
  ],
  '50000': [
    { heading: 'The point where secured borrowing becomes tempting',
      paragraphs: [
        'Fifty thousand dollars of unsecured debt is the level at which home equity borrowing starts to look attractive, because the rate difference is large: a home equity line often costs less than half what cards charge. The trade is rarely described honestly. Converting unsecured debt into secured debt moves the consequence of default from a damaged credit report to the loss of a home, and it converts a debt that bankruptcy can discharge into one that it cannot.',
        'There is also a term effect that outweighs the rate for many borrowers. A home equity line spread over twenty years at a low rate can cost more in total than card debt cleared aggressively in five, because interest accrues for four times as long. The comparison that matters is total interest over the intended payoff period, not the monthly payment, and the monthly payment is what the lender leads with.',
      ] },
  ],
  '75000': [
    { heading: 'Where formal programs start to make sense',
      paragraphs: [
        'At seventy-five thousand dollars of unsecured debt, informal approaches often stop being sufficient, and two formal routes are worth understanding before either is needed. A debt management plan, run through a non-profit credit counselling agency, consolidates payments and typically obtains reduced rates from participating creditors in exchange for closing the accounts; it does not reduce principal, and it runs three to five years. A debt settlement program, by contrast, negotiates the principal down, but it works by withholding payment until creditors accept a loss, which damages credit severely and creates taxable forgiven debt.',
        'The distinction between the two is the one most often blurred in advertising. A non-profit counselling agency charges a modest monthly fee and is regulated as such; a settlement company charges a percentage of the debt enrolled and has an incentive to enrol as much as possible. Confirming which kind of organisation is on the phone is the first step.',
      ] },
  ],
  '100000': [
    { heading: 'Mortgage-scale debt, and the bankruptcy comparison',
      paragraphs: [
        'One hundred thousand dollars is the level at which it becomes rational to compare a repayment plan against Chapter 13 bankruptcy rather than dismissing the comparison. Chapter 13 reorganises debt into a court-supervised plan of three to five years based on disposable income, discharges whatever remains of the unsecured portion at the end, and stops collection and interest accrual immediately. It stays on a credit report for seven years and requires disclosure on many applications.',
        'The honest comparison is between total amount repaid and time to a clean balance sheet, not between the stigma of one and the virtue of the other. A voluntary plan that takes eleven years and repays one hundred and sixty thousand dollars is not obviously better than a court plan that takes five and repays sixty. Where the balance is mostly student debt the comparison collapses, because student loans survive both chapters absent a hardship finding.',
      ] },
  ],
  '150000': [
    { heading: 'Professional degree debt and the forgiveness arithmetic',
      paragraphs: [
        'Balances around one hundred and fifty thousand dollars are dominated by graduate and professional degrees, and at that size the federal forgiveness programs change the objective entirely. Under an income-driven plan, the monthly payment is a percentage of discretionary income rather than a function of the balance, and the remaining balance is cancelled after the statutory period. Paying extra reduces a balance destined for cancellation, so the optimal strategy is the opposite of the usual one: pay the minimum required, document the qualifying payments, and direct spare cash elsewhere.',
        'Two conditions carry the whole strategy. Employment has to remain with a qualifying employer where Public Service Loan Forgiveness is the route, and the payment count has to be verified rather than assumed, since servicer errors in counting qualifying payments have been widespread. Where neither applies, the balance behaves like any other large debt and refinancing to a lower rate becomes the main lever.',
      ] },
  ],
  '200000': [
    { heading: 'A horizon longer than a decade changes the question',
      paragraphs: [
        'At two hundred thousand dollars, no realistic monthly payment clears the balance quickly, and the useful question stops being how fast and becomes what else is being given up. A decade of maximum payments is a decade of no retirement contributions, which has its own compounding cost: an employer match forgone is an immediate loss of fifty or a hundred per cent on the amount not contributed, which no debt interest rate matches.',
        'The framing that works at this size is net worth rather than balance. Paying a mortgage-scale debt while contributing enough to capture the full employer match, and while holding a real emergency fund, usually produces a better position after ten years than directing every dollar at the balance and arriving with no retirement savings and no buffer. Where the debt is federal student loan debt, the forgiveness route displaces the calculation entirely and should be settled first.',
      ] },
  ],
};
