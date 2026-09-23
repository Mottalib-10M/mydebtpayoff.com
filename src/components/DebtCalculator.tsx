import { useState, useMemo, type ChangeEvent } from 'react';
import {
  compareStrategies,
  type Debt,
  type PayoffStrategy,
  type StrategyComparison,
  type MonthlySnapshot,
} from '../lib/engine';

interface DebtInput {
  id: number;
  name: string;
  balance: string;
  apr: string;
  minimumPayment: string;
}

const defaultDebt = (id: number): DebtInput => ({
  id,
  name: '',
  balance: '',
  apr: '',
  minimumPayment: '',
});

const INITIAL_DEBTS: DebtInput[] = [
  { id: 1, name: 'Credit Card', balance: '5000', apr: '22.99', minimumPayment: '100' },
  { id: 2, name: 'Car Loan', balance: '15000', apr: '6.5', minimumPayment: '350' },
  { id: 3, name: 'Student Loan', balance: '25000', apr: '5.5', minimumPayment: '280' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCurrencyExact(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StackedBarChart({ schedule, debts }: { schedule: MonthlySnapshot[]; debts: Debt[] }) {
  if (schedule.length === 0) return null;

  const sampleRate = Math.max(1, Math.floor(schedule.length / 24));
  const sampledMonths = schedule.filter((_, i) => i % sampleRate === 0 || i === schedule.length - 1);
  const maxBalance = Math.max(...schedule.map((s) => s.totalRemainingBalance), 1);

  const colors = ['#7c3aed', '#059669', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-text mb-3">Debt Balance Over Time</h4>
      <div className="flex items-end gap-1" style={{ height: '200px' }}>
        {sampledMonths.map((snap) => {
          const totalHeight = (snap.totalRemainingBalance / maxBalance) * 100;
          return (
            <div
              key={snap.month}
              className="flex flex-col-reverse flex-1 min-w-0"
              style={{ height: '100%' }}
              title={`Month ${snap.month}: ${formatCurrency(snap.totalRemainingBalance)}`}
            >
              {snap.debts.map((d, di) => {
                const segmentHeight =
                  snap.totalRemainingBalance > 0
                    ? (d.endingBalance / maxBalance) * 100
                    : 0;
                return (
                  <div
                    key={d.name}
                    style={{
                      height: `${segmentHeight}%`,
                      backgroundColor: colors[di % colors.length],
                      minHeight: segmentHeight > 0 ? '1px' : '0',
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-text-muted mt-1">
        <span>Month 1</span>
        <span>Month {schedule.length}</span>
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        {debts.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1 text-sm">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DebtCalculator() {
  const [debtInputs, setDebtInputs] = useState<DebtInput[]>(INITIAL_DEBTS);
  // Le champ qu'on remplit garde son texte brut ; les autres affichent les
  // milliers separes. Mettre en forme pendant la frappe reecrirait la saisie.
  const [champActif, setChampActif] = useState<string | null>(null);
  const affiche = (v: string | number, cle: string) => {
    const s = String(v ?? '');
    if (champActif === cle || s === '') return s;
    const n = parseFloat(s.replace(/,/g, ''));
    return Number.isFinite(n) ? Math.round(n).toLocaleString('en-US') : s;
  };
  const nettoie = (v: string) => v.replace(/[^\d.,]/g, '');
  const [extraPayment, setExtraPayment] = useState('200');
  const [strategy, setStrategy] = useState<PayoffStrategy>('avalanche');
  const [nextId, setNextId] = useState(4);
  const [showTimeline, setShowTimeline] = useState(false);

  const addDebt = () => {
    setDebtInputs([...debtInputs, defaultDebt(nextId)]);
    setNextId(nextId + 1);
  };

  const removeDebt = (id: number) => {
    if (debtInputs.length <= 1) return;
    setDebtInputs(debtInputs.filter((d) => d.id !== id));
  };

  const updateDebt = (id: number, field: keyof DebtInput, value: string) => {
    setDebtInputs(debtInputs.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const validDebts: Debt[] = useMemo(() => {
    return debtInputs
      .filter(
        (d) =>
          d.name.trim() !== '' &&
          parseFloat(d.balance) > 0 &&
          parseFloat(d.apr) >= 0 &&
          parseFloat(d.minimumPayment) > 0
      )
      .map((d) => ({
        name: d.name.trim(),
        balance: parseFloat(d.balance),
        apr: parseFloat(d.apr),
        minimumPayment: parseFloat(d.minimumPayment),
      }));
  }, [debtInputs]);

  const extra = parseFloat(extraPayment) || 0;

  const comparison: StrategyComparison | null = useMemo(() => {
    if (validDebts.length === 0) return null;
    return compareStrategies(validDebts, extra);
  }, [validDebts, extra]);

  const activeResult = comparison
    ? strategy === 'avalanche'
      ? comparison.avalanche
      : comparison.snowball
    : null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Debt Inputs */}
      <div className="bg-white rounded-xl shadow-lg border border-border p-6 mb-6">
        <h3 className="text-xl font-bold text-text mb-4">Your Debts</h3>

        <div className="space-y-4">
          {debtInputs.map((debt, index) => (
            <div
              key={debt.id}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end p-4 bg-surface rounded-lg border border-border"
            >
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                  Debt Name
                </label>
                <input
                  type="text"
                  value={debt.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateDebt(debt.id, 'name', e.target.value)
                  }
                  placeholder="e.g. Credit Card"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                  Balance ($)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={affiche(debt.balance, `balance-${debt.id}`)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateDebt(debt.id, 'balance', nettoie(e.target.value))
                  }
                  onFocus={() => setChampActif(`balance-${debt.id}`)}
                  onBlur={() => setChampActif(null)}
                  placeholder="5000"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                  APR (%)
                </label>
                <input
                  type="number"
                  value={debt.apr}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateDebt(debt.id, 'apr', e.target.value)
                  }
                  placeholder="18.99"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                  Min Payment ($)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={affiche(debt.minimumPayment, `min-${debt.id}`)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateDebt(debt.id, 'minimumPayment', nettoie(e.target.value))
                  }
                  onFocus={() => setChampActif(`min-${debt.id}`)}
                  onBlur={() => setChampActif(null)}
                  placeholder="100"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => removeDebt(debt.id)}
                  disabled={debtInputs.length <= 1}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label={`Remove ${debt.name || 'debt'}`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addDebt}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          + Add Debt
        </button>

        {/* Extra Payment */}
        <div className="mt-6 p-4 bg-surface rounded-lg border border-border">
          <label className="block text-sm font-medium text-text-muted mb-1">
            Extra Monthly Payment ($)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={affiche(extraPayment, 'extra')}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setExtraPayment(nettoie(e.target.value))}
            onFocus={() => setChampActif('extra')}
            onBlur={() => setChampActif(null)}
            placeholder="200"
            min="0"
            step="any"
            className="w-full sm:w-48 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
          <p className="text-xs text-text-muted mt-1">
            Additional amount beyond minimum payments each month
          </p>
        </div>
      </div>

      {/* Strategy Toggle */}
      <div className="bg-white rounded-xl shadow-lg border border-border p-6 mb-6">
        <h3 className="text-xl font-bold text-text mb-4">Payoff Strategy</h3>
        <div className="flex gap-3">
          <button
            onClick={() => setStrategy('avalanche')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors border-2 ${
              strategy === 'avalanche'
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-text hover:border-primary-light'
            }`}
          >
            <div className="font-bold">Avalanche</div>
            <div className={`text-xs mt-1 ${strategy === 'avalanche' ? 'text-white/80' : 'text-text-muted'}`}>
              Highest APR first (saves most money)
            </div>
          </button>
          <button
            onClick={() => setStrategy('snowball')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors border-2 ${
              strategy === 'snowball'
                ? 'border-secondary bg-secondary text-white'
                : 'border-border bg-surface text-text hover:border-secondary-light'
            }`}
          >
            <div className="font-bold">Snowball</div>
            <div className={`text-xs mt-1 ${strategy === 'snowball' ? 'text-white/80' : 'text-text-muted'}`}>
              Lowest balance first (quick wins)
            </div>
          </button>
        </div>
      </div>

      {/* Results */}
      {comparison && activeResult && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-lg border border-border p-6 text-center">
              <div className="text-sm text-text-muted mb-1">Debt-Free In</div>
              <div className="text-3xl font-bold text-primary">
                {activeResult.payoffMonths}
              </div>
              <div className="text-sm text-text-muted">months</div>
              <div className="text-xs text-text-muted mt-1">
                ({Math.floor(activeResult.payoffMonths / 12)} years{' '}
                {activeResult.payoffMonths % 12} months)
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-border p-6 text-center">
              <div className="text-sm text-text-muted mb-1">Total Interest</div>
              <div className="text-3xl font-bold text-red-600">
                {formatCurrency(activeResult.totalInterestPaid)}
              </div>
              <div className="text-sm text-text-muted">paid in interest</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-border p-6 text-center">
              <div className="text-sm text-text-muted mb-1">Total Paid</div>
              <div className="text-3xl font-bold text-text">
                {formatCurrency(activeResult.totalAmountPaid)}
              </div>
              <div className="text-sm text-text-muted">principal + interest</div>
            </div>
          </div>

          {/* Strategy Comparison */}
          {comparison.interestSaved > 0 && (
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg p-6 text-white">
              <h4 className="text-lg font-bold mb-2">Strategy Comparison</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-white/80">Avalanche Interest</div>
                  <div className="text-xl font-bold">
                    {formatCurrencyExact(comparison.avalanche.totalInterestPaid)}
                  </div>
                  <div className="text-sm text-white/80 mt-1">
                    {comparison.avalanche.payoffMonths} months
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/80">Snowball Interest</div>
                  <div className="text-xl font-bold">
                    {formatCurrencyExact(comparison.snowball.totalInterestPaid)}
                  </div>
                  <div className="text-sm text-white/80 mt-1">
                    {comparison.snowball.payoffMonths} months
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <span className="text-lg">
                  Avalanche saves you{' '}
                  <strong className="text-accent-light">
                    {formatCurrencyExact(comparison.interestSaved)}
                  </strong>{' '}
                  in interest
                  {comparison.monthsDifference > 0 && (
                    <span>
                      {' '}and{' '}
                      <strong className="text-accent-light">
                        {comparison.monthsDifference} month{comparison.monthsDifference !== 1 ? 's' : ''}
                      </strong>{' '}
                      faster
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-border p-6">
            <StackedBarChart schedule={activeResult.schedule} debts={validDebts} />
          </div>

          {/* Timeline Toggle */}
          <div className="bg-white rounded-xl shadow-lg border border-border p-6">
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="flex items-center gap-2 text-lg font-semibold text-text hover:text-primary transition-colors"
            >
              <span>{showTimeline ? '[-]' : '[+]'}</span>
              Month-by-Month Timeline
            </button>

            {showTimeline && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-text-muted">Month</th>
                      <th className="text-right py-2 px-3 font-medium text-text-muted">Payment</th>
                      <th className="text-right py-2 px-3 font-medium text-text-muted">Interest</th>
                      <th className="text-right py-2 px-3 font-medium text-text-muted">Principal</th>
                      <th className="text-right py-2 px-3 font-medium text-text-muted">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeResult.schedule.map((snap) => (
                      <tr key={snap.month} className="border-b border-border/50 hover:bg-surface">
                        <td className="py-2 px-3">{snap.month}</td>
                        <td className="py-2 px-3 text-right">
                          {formatCurrencyExact(snap.totalPayment)}
                        </td>
                        <td className="py-2 px-3 text-right text-red-600">
                          {formatCurrencyExact(snap.totalInterest)}
                        </td>
                        <td className="py-2 px-3 text-right text-secondary">
                          {formatCurrencyExact(snap.totalPrincipal)}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          {formatCurrencyExact(snap.totalRemainingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {!comparison && (
        <div className="bg-white rounded-xl shadow-lg border border-border p-8 text-center">
          <p className="text-text-muted text-lg">
            Enter at least one debt above to see your payoff plan.
          </p>
        </div>
      )}
    </div>
  );
}
