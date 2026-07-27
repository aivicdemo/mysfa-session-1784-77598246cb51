import { reconcileInvoicesWithDeal } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-540
  test('[normal] 複数の請求書が同じ金額で並ぶとき、正常に照合処理が完了する', async () => {
    // Setup: 商談レコード
    const dealId = 'DEAL-001';
    const dealStatus = '受注確定';
    const dealAmount = 100000;

    // Setup: 請求書レコード（DocumentStorageAdapterのスタブで疑似アップロード済み）
    const invoices = [
      {
        invoiceId: 'INV-001',
        amount: 100000,
        issueDate: '2024-01-10',
        status: '発行済み',
        documentUrl: 'https://drive.example.com/file/d/mock-id-001',
      },
      {
        invoiceId: 'INV-002',
        amount: 100000,
        issueDate: '2024-01-15',
        status: '発行済み',
        documentUrl: 'https://drive.example.com/file/d/mock-id-002',
      },
      {
        invoiceId: 'INV-003',
        amount: 100000,
        issueDate: '2024-01-20',
        status: '発行済み',
        documentUrl: 'https://drive.example.com/file/d/mock-id-003',
      },
    ];

    // Setup: 照合対象の入力データ
    const reconciliationInput = {
      dealId,
      dealStatus,
      dealAmount,
      invoices,
      executionTimestamp: '2024-01-20T15:30:00Z',
    };

    // Execute: 照合・ズレ検出ロジックを実行
    const reconciliationResult = await reconcileInvoicesWithDeal(
      reconciliationInput
    );

    // Assertion 1: ジョブ実行ステータスが SUCCESS であることを確認
    expect(reconciliationResult.jobStatus).toBe('SUCCESS');

    // Assertion 2: 3件の請求書すべてが個別に照合済みとしてマークされていることを確認
    expect(reconciliationResult.reconciledInvoiceIds).toEqual([
      'INV-001',
      'INV-002',
      'INV-003',
    ]);
    expect(reconciliationResult.reconciledInvoiceIds.length).toBe(3);

    // Assertion 3: 照合結果テーブルに3件のレコードが登録され、各レコードの状態が「照合完了」
    expect(reconciliationResult.reconciliationRecords.length).toBe(3);
    reconciliationResult.reconciliationRecords.forEach((record) => {
      expect(record.reconciliationStatus).toBe('照合完了');
      expect(record.dealId).toBe(dealId);
      expect(record.matchedAmount).toBe(100000);
    });

    // Assertion 4: ズレ検出結果は異常なし（double-count、unmatchedInvoices の両方が空）
    expect(reconciliationResult.discrepancyDetected).toBe(false);
    expect(reconciliationResult.doubleCountedInvoices.length).toBe(0);
    expect(reconciliationResult.unmatchedInvoices.length).toBe(0);

    // Assertion 5: 照合処理の実行時刻がシステム時刻として記録される
    expect(reconciliationResult.executionTime).toBe('2024-01-20T15:30:00Z');
    expect(typeof reconciliationResult.executionTime).toBe('string');
  });
});