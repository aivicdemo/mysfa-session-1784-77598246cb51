import { aggregateLicenseCosts } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce ライセンス利用状況の可視化機能', () => {
  // SCEN-026: [error] ライセンス費用集計機能 - 無効な契約情報が含まれている場合にエラーが発生する
  test('should throw error when license contract data is invalid - missing contract ID', () => {
    const invalidContracts = [
      {
        contractId: '',
        editionName: 'Sales Cloud',
        userCount: 10,
        annualCost: 120000,
        contractStartDate: '2024-01-01',
        contractEndDate: '2024-12-31',
      },
    ];

    expect(() => aggregateLicenseCosts(invalidContracts)).toThrow(/契約ID/);
  });

  test('should throw error when license contract data has negative cost', () => {
    const invalidContracts = [
      {
        contractId: 'CNT-001',
        editionName: 'Sales Cloud',
        userCount: 10,
        annualCost: -120000,
        contractStartDate: '2024-01-01',
        contractEndDate: '2024-12-31',
      },
    ];

    expect(() => aggregateLicenseCosts(invalidContracts)).toThrow(/金額/);
  });

  test('should throw error when license contract data has invalid date format', () => {
    const invalidContracts = [
      {
        contractId: 'CNT-001',
        editionName: 'Sales Cloud',
        userCount: 10,
        annualCost: 120000,
        contractStartDate: 'invalid-date',
        contractEndDate: '2024-12-31',
      },
    ];

    expect(() => aggregateLicenseCosts(invalidContracts)).toThrow(/日付/);
  });

  test('should throw error when license contract has zero user count', () => {
    const invalidContracts = [
      {
        contractId: 'CNT-001',
        editionName: 'Sales Cloud',
        userCount: 0,
        annualCost: 120000,
        contractStartDate: '2024-01-01',
        contractEndDate: '2024-12-31',
      },
    ];

    expect(() => aggregateLicenseCosts(invalidContracts)).toThrow(/ユーザー数/);
  });

  test('should throw error when license contract has missing edition name', () => {
    const invalidContracts = [
      {
        contractId: 'CNT-001',
        editionName: '',
        userCount: 10,
        annualCost: 120000,
        contractStartDate: '2024-01-01',
        contractEndDate: '2024-12-31',
      },
    ];

    expect(() => aggregateLicenseCosts(invalidContracts)).toThrow(/エディション/);
  });

  test('should throw error when contract end date is before start date', () => {
    const invalidContracts = [
      {
        contractId: 'CNT-001',
        editionName: 'Sales Cloud',
        userCount: 10,
        annualCost: 120000,
        contractStartDate: '2024-12-31',
        contractEndDate: '2024-01-01',
      },
    ];

    expect(() => aggregateLicenseCosts(invalidContracts)).toThrow(/契約期間/);
  });

  test('should successfully aggregate costs with valid contract data', () => {
    const validContracts = [
      {
        contractId: 'CNT-001',
        editionName: 'Sales Cloud',
        userCount: 10,
        annualCost: 120000,
        contractStartDate: '2024-01-01',
        contractEndDate: '2024-12-31',
      },
      {
        contractId: 'CNT-002',
        editionName: 'Service Cloud',
        userCount: 5,
        annualCost: 60000,
        contractStartDate: '2024-01-01',
        contractEndDate: '2024-12-31',
      },
    ];

    const result = aggregateLicenseCosts(validContracts);

    expect(result.totalAnnualCost).toBe(180000);
    expect(result.totalUserCount).toBe(15);
    expect(result.contractCount).toBe(2);
    expect(result.editionBreakdown).toEqual({
      'Sales Cloud': {
        userCount: 10,
        annualCost: 120000,
        contractCount: 1,
      },
      'Service Cloud': {
        userCount: 5,
        annualCost: 60000,
        contractCount: 1,
      },
    });
    expect(result.aggregationTimestamp).toBeDefined();
  });
});