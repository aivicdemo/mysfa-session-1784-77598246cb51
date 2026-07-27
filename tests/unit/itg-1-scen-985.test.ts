import { determineMigrationCompletion } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-985: [edge] 移行完了判定機能 - 照合対象の売上実績件数が0の場合、データ不足として移行判定が保留される
  test('移行完了判定機能で売上実績件数が0の場合、移行ステータスが保留に設定され、保留理由が記録される', () => {
    const mockSalesRecords: unknown[] = [];
    const mockBillingRecords = [
      {
        invoiceId: 'INV-001',
        customerId: 'CUST-A',
        amount: 100000,
        issuedDate: '2024-01-15',
        status: 'issued',
      },
      {
        invoiceId: 'INV-002',
        customerId: 'CUST-B',
        amount: 50000,
        issuedDate: '2024-01-16',
        status: 'issued',
      },
    ];

    const result = determineMigrationCompletion({
      salesRecords: mockSalesRecords,
      billingRecords: mockBillingRecords,
      migrationContext: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
    });

    expect(result.migrationStatus).toBe('suspended');
    expect(result.suspensionReason).toBe('照合対象の売上実績件数が不足しています');
    expect(result.userMessage).toBe('データ不足のため移行判定を保留しています');
    expect(result.isMigrationProcessed).toBe(false);
  });
});