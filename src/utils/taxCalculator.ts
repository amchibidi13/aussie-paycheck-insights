
export interface TaxBracket {
  min: number;
  max: number | null;
  baseAmount: number;
  rate: number;
}

export interface TaxYear {
  year: string;
  brackets: TaxBracket[];
  medicareLevy: number;
  superRate: number;
}

// Australian tax brackets for different financial years
export const taxYears: Record<string, TaxYear> = {
  "2022-23": {
    year: "2022-23",
    brackets: [
      { min: 0, max: 18200, baseAmount: 0, rate: 0 },
      { min: 18201, max: 45000, baseAmount: 0, rate: 0.19 },
      { min: 45001, max: 120000, baseAmount: 5092, rate: 0.325 },
      { min: 120001, max: 180000, baseAmount: 29467, rate: 0.37 },
      { min: 180001, max: null, baseAmount: 51667, rate: 0.45 }
    ],
    medicareLevy: 0.02,
    superRate: 0.105
  },
  "2023-24": {
    year: "2023-24",
    brackets: [
      { min: 0, max: 18200, baseAmount: 0, rate: 0 },
      { min: 18201, max: 45000, baseAmount: 0, rate: 0.19 },
      { min: 45001, max: 120000, baseAmount: 5092, rate: 0.325 },
      { min: 120001, max: 180000, baseAmount: 29467, rate: 0.37 },
      { min: 180001, max: null, baseAmount: 51667, rate: 0.45 }
    ],
    medicareLevy: 0.02,
    superRate: 0.11
  },
  "2024-25": {
    year: "2024-25",
    brackets: [
      { min: 0, max: 18200, baseAmount: 0, rate: 0 },
      { min: 18201, max: 45000, baseAmount: 0, rate: 0.16 },
      { min: 45001, max: 135000, baseAmount: 4294, rate: 0.30 },
      { min: 135001, max: 190000, baseAmount: 31094, rate: 0.37 },
      { min: 190001, max: null, baseAmount: 51424, rate: 0.45 }
    ],
    medicareLevy: 0.02,
    superRate: 0.115
  },
  "2025-26": {
    year: "2025-26",
    brackets: [
      { min: 0, max: 18200, baseAmount: 0, rate: 0 },
      { min: 18201, max: 45000, baseAmount: 0, rate: 0.16 },
      { min: 45001, max: 135000, baseAmount: 4294, rate: 0.30 },
      { min: 135001, max: 190000, baseAmount: 31094, rate: 0.37 },
      { min: 190001, max: null, baseAmount: 51424, rate: 0.45 }
    ],
    medicareLevy: 0.02,
    superRate: 0.12
  }
};

// Function to add a new tax year
export function addTaxYear(yearKey: string, taxYear: TaxYear) {
  if (taxYears[yearKey]) {
    throw new Error(`Tax year ${yearKey} already exists`);
  }
  
  taxYears[yearKey] = taxYear;
}

// Function to update an existing tax year or specific parts of it
export function updateTaxYear(yearKey: string, updates: Partial<TaxYear>) {
  if (!taxYears[yearKey]) {
    throw new Error(`Tax year ${yearKey} not found`);
  }
  
  taxYears[yearKey] = {
    ...taxYears[yearKey],
    ...updates
  };
}

export interface SalaryCalculationResult {
  grossAnnual: number;
  tax: number;
  medicareLevy: number;
  netAnnual: number;
  netMonthly: number;
  netFortnightly: number;
  superannuation: number;
}

export interface ContractCalculationResult {
  baseAnnualSalary: number;
  contractAnnual: {
    min: number;
    max: number;
    selected: number;
  };
  contractMonthly: number;
  contractDaily: number;
  upliftPercentage: number;
}

export function calculateTakeHomeSalary(
  grossAnnual: number,
  yearKey: string,
  includingSuper: boolean,
  customSuperRate?: number
): SalaryCalculationResult {
  const taxYear = taxYears[yearKey];
  if (!taxYear) {
    throw new Error(`Tax year ${yearKey} not found`);
  }

  const superRate = customSuperRate !== undefined ? customSuperRate / 100 : taxYear.superRate;
  
  let actualGross: number;
  let superAmount: number;
  
  if (includingSuper) {
    actualGross = grossAnnual / (1 + superRate);
    superAmount = grossAnnual - actualGross;
  } else {
    actualGross = grossAnnual;
    superAmount = grossAnnual * superRate;
  }

  // Calculate tax
  let tax = 0;
  for (const bracket of taxYear.brackets) {
    if (actualGross > bracket.min) {
      const taxableInBracket = 
        bracket.max === null 
          ? actualGross - bracket.min 
          : Math.min(actualGross, bracket.max) - bracket.min;
          
      if (bracket.min === 0 && bracket.rate === 0) {
        // Tax-free threshold
        tax += 0;
      } else if (actualGross <= bracket.min) {
        // Below this bracket
        continue;
      } else if (actualGross > bracket.min && (bracket.max === null || actualGross <= bracket.max)) {
        // Partially in this bracket
        tax = bracket.baseAmount + ((actualGross - bracket.min) * bracket.rate);
        break;
      }
    }
  }

  // Calculate Medicare levy (2%)
  const medicareLevy = actualGross * taxYear.medicareLevy;
  
  // Calculate net income
  const netAnnual = actualGross - tax - medicareLevy;
  const netMonthly = netAnnual / 12;
  const netFortnightly = netAnnual / 26;

  return {
    grossAnnual: actualGross,
    tax,
    medicareLevy,
    netAnnual,
    netMonthly,
    netFortnightly,
    superannuation: superAmount
  };
}

export function calculateContractRate(
  annualSalary: number,
  upliftPercentage: number = 20
): ContractCalculationResult {
  const minUplift = 15;
  const maxUplift = 30;
  
  const contractAnnualMin = annualSalary * (1 + minUplift / 100);
  const contractAnnualMax = annualSalary * (1 + maxUplift / 100);
  const contractAnnualSelected = annualSalary * (1 + upliftPercentage / 100);
  
  const workingDaysPerYear = 230;
  const contractDaily = contractAnnualSelected / workingDaysPerYear;
  
  return {
    baseAnnualSalary: annualSalary,
    contractAnnual: {
      min: contractAnnualMin,
      max: contractAnnualMax,
      selected: contractAnnualSelected
    },
    contractMonthly: contractAnnualSelected / 12,
    contractDaily,
    upliftPercentage
  };
}
