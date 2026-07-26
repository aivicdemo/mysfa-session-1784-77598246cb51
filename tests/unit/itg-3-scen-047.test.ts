import { describe, test, expect, beforeEach } from '@jest/globals';
import { validateLicenseCost } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforceライセンス利用状況の可視化機能', () => {
  // SCEN-047
  test('ライセンス費用が負の値の場合、バリデーションエラーが発生する', () => {
    const negativeInput = {
      licenseCost: -100,
    };

    expect(() => {
      validateLicenseCost(negativeInput);
    }).toThrow(/ライセンス費用/);
  });

  test('ライセンス費用が0の場合、バリデーションを通過する', () => {
    const zeroInput = {
      licenseCost: 0,
    };

    const result = validateLicenseCost(zeroInput);
    expect(result).toEqual({ isValid: true, licenseCost: 0 });
  });

  test('ライセンス費用が正の値の場合、バリデーションを通過する', () => {
    const positiveInput = {
      licenseCost: 1000000,
    };

    const result = validateLicenseCost(positiveInput);
    expect(result).toEqual({ isValid: true, licenseCost: 1000000 });
  });

  test('ライセンス費用が小数の正の値の場合、バリデーションを通過する', () => {
    const decimalInput = {
      licenseCost: 50000.5,
    };

    const result = validateLicenseCost(decimalInput);
    expect(result).toEqual({ isValid: true, licenseCost: 50000.5 });
  });

  test('ライセンス費用が非常に大きい正の値の場合、バリデーションを通過する', () => {
    const largeInput = {
      licenseCost: 999999999,
    };

    const result = validateLicenseCost(largeInput);
    expect(result).toEqual({ isValid: true, licenseCost: 999999999 });
  });

  test('ライセンス費用が非常に小さい負の値の場合、バリデーションエラーが発生する', () => {
    const smallNegativeInput = {
      licenseCost: -0.01,
    };

    expect(() => {
      validateLicenseCost(smallNegativeInput);
    }).toThrow(/ライセンス費用/);
  });

  test('ライセンス費用が大きな負の値の場合、バリデーションエラーが発生する', () => {
    const largeNegativeInput = {
      licenseCost: -1000000,
    };

    expect(() => {
      validateLicenseCost(largeNegativeInput);
    }).toThrow(/ライセンス費用/);
  });
});