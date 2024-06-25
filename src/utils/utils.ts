import { evaluate, round, subtract, compare, divide, multiply } from 'mathjs';
import { v7 as uuidv7 } from 'uuid';

// NOTE: Yes these are a little pointless, but it's to keep this important logic centralized and testable

export const genUuid = () => uuidv7();

export const roundTo2Decimals = (num: number): number => round(num, 2);

export const evaluateExprAndRoundTo2Decimals = (expr: string): number => roundTo2Decimals(evaluate(expr));

export const getMonetaryValue2DecimalString = (num: number): string => num.toFixed(2);

export const calcMonetaryDifference = (minuend: number, subtrahend: number): number =>
  subtract(roundTo2Decimals(minuend), roundTo2Decimals(subtrahend));

export const calcMonetaryValuesRatioAsPercentInt = (dividend: number, divisor: number): number => {
  if (dividend === 0 || divisor === 0) return 0;

  const ratio = divide(dividend, divisor);
  const intRatio = round(multiply(ratio, 100));
  const rangeLimitedValue = Math.max(0, Math.min(100, intRatio));

  return rangeLimitedValue;
};

type ComparisonStringType = 'over' | 'equal' | 'under';
export const compareMonetaryValues = (a: number, b: number): ComparisonStringType => {
  const comparisonResult = compare(roundTo2Decimals(a), roundTo2Decimals(b));

  let comparisonString: ComparisonStringType = 'equal';

  if (comparisonResult === 1) {
    comparisonString = 'over';
  } else if (comparisonResult === -1) {
    comparisonString = 'under';
  }

  return comparisonString;
};

export const getCurrencyString = (amount: number, withDollarSignPrefix = true) => `${withDollarSignPrefix ? '$' : ''}${amount.toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

export const getAbsDiffAndComparisonOfMonetaryValues = (a: number, b: number): [ComparisonStringType, string] => {
  const differenceResult = calcMonetaryDifference(a, b);
  const comparisonString = compareMonetaryValues(differenceResult, 0);
  const differenceString = getCurrencyString(Math.abs(differenceResult), false);

  return [comparisonString, differenceString];
};

export const moveMonth = (curDate: Date, direction: 'forward' | 'backward'): Date => {
  const curYear = curDate.getFullYear();
  const curMonth = curDate.getMonth();

  let newYear = curYear;
  let newMonth = curMonth;

  if (direction === 'forward') {
    if (curMonth === 11) {
      newYear = curYear + 1;
      newMonth = 0;
    } else {
      newMonth = curMonth + 1;
    }
  } else {
    if (curMonth === 0) {
      newYear = curYear - 1;
      newMonth = 11;
    } else {
      newMonth = curMonth - 1;
    }
  }

  return new Date(newYear, newMonth, 1);
};
