import { extractCustomersByPeriod } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-106
  test('月次報告期限・データ抽出処理 - 抽出対象期間内に作成された顧客レコード1件のみの場合、その1件が返される', () => {
    const customerWithinPeriod = {
      customerId: 'CUST-001',
      customerName: 'テスト太郎',
      createdAt: new Date('2024-01-15T10:30:00Z'),
    };

    const customerBeforePeriod = {
      customerId: 'CUST-002',
      customerName: 'テスト花子',
      createdAt: new Date('2023-12-25T14:00:00Z'),
    };

    const customerAfterPeriod = {
      customerId: 'CUST-003',
      customerName: 'テスト次郎',
      createdAt: new Date('2024-02-05T09:15:00Z'),
    };

    const allCustomers = [
      customerBeforePeriod,
      customerWithinPeriod,
      customerAfterPeriod,
    ];

    const periodStart = new Date('2024-01-01T00:00:00Z');
    const periodEnd = new Date('2024-01-31T23:59:59Z');

    const result = extractCustomersByPeriod(allCustomers, periodStart, periodEnd);

    expect(result).toEqual([customerWithinPeriod]);
    expect(result).toHaveLength(1);
    expect(result[0].customerId).toBe('CUST-001');
    expect(result[0].customerName).toBe('テスト太郎');
    expect(result[0].createdAt).toEqual(new Date('2024-01-15T10:30:00Z'));
  });
});