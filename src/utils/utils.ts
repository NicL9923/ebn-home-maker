import { evaluate, round, subtract, compare, divide, multiply } from 'mathjs';
import { v7 as uuidv7 } from 'uuid';
import { catSubcatKeySeparator } from '../components/Forms/AddOrEditTransaction';

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

export const getCurrencyString = (amount: number, withDollarSignPrefix = true) =>
    `${withDollarSignPrefix ? '$' : ''}${amount.toLocaleString(undefined, {
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

    const c = (hash & 0x00ffffff).toString(16).toUpperCase();

    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const niceChartColors = [
    '#3366cc',
    '#dc3912',
    '#ff9900',
    '#109618',
    '#990099',
    '#0099c6',
    '#dd4477',
    '#66aa00',
    '#b82e2e',
    '#316395',
    '#994499',
    '#22aa99',
    '#aaaa11',
    '#6633cc',
    '#e67300',
    '#8b0707',
    '#651067',
    '#329262',
    '#5574a6',
    '#3b3eac',
    '#b77322',
    '#16d620',
    '#b91383',
    '#f4359e',
    '#9c5935',
    '#a9c413',
    '#2a778d',
    '#668d1c',
    '#bea413',
    '#0c5922',
    '#743411',
];

export const getNiceChartColor = (index: number) => niceChartColors[index % niceChartColors.length];

export const getCombinedCategoryString = (categoryName: string, subcategoryName: string) =>
    `${categoryName}${catSubcatKeySeparator}${subcategoryName}`;

export const hashBarcodeToPrice = (barcode: string): number => {
    // Create multiple hash values from the barcode for different purposes
    let hash1 = 0;
    let hash2 = 0;

    for (let i = 0; i < barcode.length; i++) {
        const char = barcode.charCodeAt(i);
        // First hash for price tier determination
        hash1 = (hash1 << 5) - hash1 + char;
        // Second hash for price within tier (using different algorithm)
        hash2 = hash2 * 31 + char;
    }

    // Convert to positive integers
    hash1 = Math.abs(hash1);
    hash2 = Math.abs(hash2);

    // Use first hash to determine price tier (0-99)
    const tierRoll = hash1 % 100;

    // Use second hash for price within the selected tier
    const priceRoll = hash2 % 10000; // 0-9999 for more precision

    let price: number;

    if (tierRoll < 70) {
        // 70% chance: $0.01 - $20.00
        price = ((priceRoll % 2000) + 1) / 100;
    } else if (tierRoll < 95) {
        // 25% chance: $20.01 - $100.00
        price = ((priceRoll % 8000) + 2001) / 100;
    } else {
        // 5% chance: $100.01 - $1000.00
        price = ((priceRoll % 90000) + 10001) / 100;
    }

    // Round to 2 decimal places
    return Math.round(price * 100) / 100;
};
