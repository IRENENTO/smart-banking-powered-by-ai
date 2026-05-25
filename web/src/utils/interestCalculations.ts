export interface SimpleInterestResult {
  totalInterest: number;
  totalAmount: number;
  monthlyPayment: number;
}

export interface CompoundInterestResult {
  emi: number;
  totalInterest: number;
  totalAmount: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface YearlyBreakdownRow {
  year: number;
  totalPaid: number;
  interestPaid: number;
  principalPaid: number;
  remainingBalance: number;
}

export function calculateSimpleInterest(
  principal: number,
  annualRate: number,
  months: number
): SimpleInterestResult {
  if (months <= 0 || principal <= 0) {
    return { totalInterest: 0, totalAmount: 0, monthlyPayment: 0 };
  }
  const timeYears = months / 12;
  const totalInterest = principal * (annualRate / 100) * timeYears;
  const totalAmount = principal + totalInterest;
  const monthlyPayment = totalAmount / months;
  return {
    totalInterest: Math.round(totalInterest),
    totalAmount: Math.round(totalAmount),
    monthlyPayment: Math.round(monthlyPayment),
  };
}

export function calculateCompoundEMI(
  principal: number,
  annualRate: number,
  months: number
): CompoundInterestResult {
  if (months <= 0 || principal <= 0) {
    return { emi: 0, totalInterest: 0, totalAmount: 0 };
  }
  if (annualRate === 0) {
    const emi = Math.round(principal / months);
    return { emi, totalInterest: 0, totalAmount: principal };
  }
  const monthlyRate = annualRate / 100 / 12;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  const totalAmount = emi * months;
  const totalInterest = totalAmount - principal;
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalAmount: Math.round(totalAmount),
  };
}

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  months: number
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  if (months <= 0 || principal <= 0) return schedule;

  if (annualRate === 0) {
    const monthlyPayment = Math.round(principal / months);
    let remaining = principal;
    for (let i = 1; i <= months; i++) {
      const payment = i === months ? remaining : monthlyPayment;
      remaining -= payment;
      schedule.push({
        month: i,
        payment,
        principalPaid: payment,
        interestPaid: 0,
        remainingBalance: Math.max(0, remaining),
      });
    }
    return schedule;
  }

  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  const emi =
    (principal * monthlyRate * factor) / (factor - 1);
  let balance = principal;

  for (let i = 1; i <= months; i++) {
    const interestPaid = balance * monthlyRate;
    const principalPaid = emi - interestPaid;
    balance -= principalPaid;
    schedule.push({
      month: i,
      payment: Math.round(emi),
      principalPaid: Math.round(principalPaid),
      interestPaid: Math.round(interestPaid),
      remainingBalance: Math.max(0, Math.round(balance)),
    });
  }

  return schedule;
}

export function generateYearlyBreakdown(
  principal: number,
  annualRate: number,
  months: number
): YearlyBreakdownRow[] {
  const schedule = generateAmortizationSchedule(principal, annualRate, months);
  const years = Math.ceil(months / 12);
  const rows: YearlyBreakdownRow[] = [];
  let monthIndex = 0;

  for (let year = 1; year <= years; year++) {
    const monthsInYear = Math.min(12, months - monthIndex);
    const yearRows = schedule.slice(monthIndex, monthIndex + monthsInYear);
    const totalPaid = yearRows.reduce((s, r) => s + r.payment, 0);
    const interestPaid = yearRows.reduce((s, r) => s + r.interestPaid, 0);
    const principalPaid = yearRows.reduce((s, r) => s + r.principalPaid, 0);
    const remainingBalance =
      yearRows[yearRows.length - 1]?.remainingBalance ?? 0;
    rows.push({
      year,
      totalPaid: Math.round(totalPaid),
      interestPaid: Math.round(interestPaid),
      principalPaid: Math.round(principalPaid),
      remainingBalance,
    });
    monthIndex += monthsInYear;
  }

  return rows;
}

export function formatRWF(amount: number): string {
  return 'RWF ' + amount.toLocaleString();
}
