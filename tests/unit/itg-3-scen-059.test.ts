import { describe, test, expect } from '@jest/globals';
import { calculateLicenseReductionEffect } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能', () => {
  // SCEN-059
  test('自社システム運用コストが初期構築コストを超える場合、エラーが発生する', () => {
    const salesforceLicenseCostAnnual = 5000000;
    const initialConstructionCost = 1000000;
    const annualMaintenanceCost = 1500000;
    const currentUserCount = 100;
    const migrationMonthCount = 1;

    expect(() =>
      calculateLicenseReductionEffect({
        salesforceLicenseCostAnnual,
        initialConstructionCost,
        annualMaintenanceCost,
        currentUserCount,
        migrationMonthCount,
      })
    ).toThrow(/運用コスト/);
  });
});