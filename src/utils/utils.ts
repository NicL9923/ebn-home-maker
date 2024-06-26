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

export const getHashedHexColor = (string: string) => {
  let hash = 0;

  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();

  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const niceChartColors = ['#3366cc','#dc3912','#ff9900','#109618',
  '#990099','#0099c6','#dd4477','#66aa00',
  '#b82e2e','#316395','#994499','#22aa99',
  '#aaaa11','#6633cc','#e67300','#8b0707',
  '#651067','#329262','#5574a6','#3b3eac',
  '#b77322','#16d620','#b91383','#f4359e',
  '#9c5935','#a9c413','#2a778d','#668d1c',
  '#bea413','#0c5922','#743411'];

export const getNiceChartColor = (index: number) => niceChartColors[index % niceChartColors.length];
