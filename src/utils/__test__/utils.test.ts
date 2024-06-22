import { expect, it, describe } from 'vitest';
import {
  calcMonetaryDifference,
  calcMonetaryValuesRatioAsPercentInt,
  compareMonetaryValues,
  evaluateExprAndRoundTo2Decimals,
  genUuid,
  getAbsDiffAndComparisonOfMonetaryValues,
  getMonetaryValue2DecimalString,
  roundTo2Decimals,
} from '../utils';

describe('utils', () => {
  describe('genUuid', () => {
    it('generates a uuid string', () => {
      expect(genUuid()).toBeTypeOf('string');
    });
  });

  describe('roundTo2Decimals', () => {
    it('rounds to 2 decimals', () => {
      expect(roundTo2Decimals(1.2345)).toBe(1.23);
    });

    it('returns the same value when already 2 decimals', () => {
      expect(roundTo2Decimals(1.46)).toBe(1.46);
    });

    it('doesnt add decimals when none present', () => {
      expect(roundTo2Decimals(2)).toBe(2);
    });
  });

  describe('evaluateExprAndRoundTo2Decimals', () => {
    it('evaluates an expression and rounds to 2 decimals', () => {
      expect(evaluateExprAndRoundTo2Decimals('1.2345 + 2.3456')).toBe(3.58);
    });

    it('evaluates an expression without adding decimals', () => {
      expect(evaluateExprAndRoundTo2Decimals('1 + 3 + 8')).toBe(12);
    });
  });

  describe('getMonetaryValue2DecimalString', () => {
    it('adds decimals if necessary', () => {
      expect(getMonetaryValue2DecimalString(2)).toBe('2.00');
    });

    it('doesnt change 2 decimals', () => {
      expect(getMonetaryValue2DecimalString(1.07)).toBe('1.07');
    });

    it('removes decimals if necessary (INCLUDES rounding)', () => {
      expect(getMonetaryValue2DecimalString(3.3783)).toBe('3.38');
    });
  });

  describe('calcMonetaryDifference', () => {
    it('calculates the difference between two monetary values (both rounded to 2 decimals BEFORE calculation)', () => {
      expect(calcMonetaryDifference(1.2345, 2.3456)).toBe(-1.12);
    });

    it('calculates the difference between two simple monetary values', () => {
      expect(calcMonetaryDifference(7, 2)).toBe(5);
    });
  });

  describe('calcMonetaryValuesRatioAsPercentInt', () => {
    it('calculates the ratio represented as a percentage integer', () => {
      expect(calcMonetaryValuesRatioAsPercentInt(1.2345, 2.3456)).toBe(53);
    });

    it('has a max limit of 100', () => {
      expect(calcMonetaryValuesRatioAsPercentInt(3.7, 1.82)).toBe(100);
    });

    it('has a minimum limit of 0', () => {
      expect(calcMonetaryValuesRatioAsPercentInt(-0.03, 3)).toBe(0);
    });

    it('returns 0 instead of 100 when the dividend/divisor are 0', () => {
      expect(calcMonetaryValuesRatioAsPercentInt(0.0, 0)).toBe(0);
    });
  });

  describe('compareMonetaryValues', () => {
    it('Correctly calculates when the first value is less than the second', () => {
      expect(compareMonetaryValues(3.33, 3.34)).toBe('under');
    });

    it('Correctly calculates when the first value is equal to the second', () => {
      expect(compareMonetaryValues(3.33, 3.33)).toBe('equal');
    });

    it('Correctly calculates when the first value is greater than the second', () => {
      expect(compareMonetaryValues(3.34, 3.33)).toBe('over');
    });

    it('Correctly calculates when the first value is equal to the second MONETARILY-SPEAKING', () => {
      expect(compareMonetaryValues(3.3314, 3.332222)).toBe('equal');
    });
  });

  describe('getAbsDiffAndComparisonOfMonetaryValues', () => {
    it('correctly calculates an under difference', () => {
      expect(getAbsDiffAndComparisonOfMonetaryValues(1.2345, 2.3456)).toEqual(['under', '1.12']);
    });

    it('correctly calculates equality (monetarily-speaking)', () => {
      expect(getAbsDiffAndComparisonOfMonetaryValues(7.2311, 7.2304)).toEqual(['equal', '0.00']);
    });

    it('correctly calculates an over difference', () => {
      expect(getAbsDiffAndComparisonOfMonetaryValues(13.47, 2.83)).toEqual(['over', '10.64']);
    });
  });
});
