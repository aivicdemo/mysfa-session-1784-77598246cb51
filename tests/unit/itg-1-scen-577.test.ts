import { detectDuplicateDealsAndReconcile } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書の自動照合・遅延案件検出', () => {
  // SCEN-577
  test('入力リストに同一の商談IDが重複して含まれている場合、重複排除して処理される', () => {
    // Precondition: テスト用データベース初期化
    // 商談テーブルに3件をセットアップ
    const dealDatabase = new Map([
      [
        'DEAL-001',
        {
          dealId: 'DEAL-001',
          status: 'contract',
          invoiceIssuedDate: null as string | null,
          invoiceAmount: 150000,
          expectedInvoiceDate: new Date('2024-01-10'),
        },
      ],
      [
        'DEAL-002',
        {
          dealId: 'DEAL-002',
          status: 'proposal',
          invoiceIssuedDate: null as string | null,
          invoiceAmount: 0,
          expectedInvoiceDate: new Date('2024-02-15'),
        },
      ],
      [
        'DEAL-003',
        {
          dealId: 'DEAL-003',
          status: 'contract',
          invoiceIssuedDate: null as string | null,
          invoiceAmount: 250000,
          expectedInvoiceDate: new Date('2024-01-20'),
        },
      ],
    ]);

    // Trigger: 入力リストに重複を含む商談IDを渡す
    const inputDealIds = ['DEAL-001', 'DEAL-002', 'DEAL-001', 'DEAL-003', 'DEAL-001'];

    // Action: 商談ステータスと請求書の自動照合・遅延案件検出機能を実行
    const result = detectDuplicateDealsAndReconcile(inputDealIds, dealDatabase);

    // Expected outcome: 重複排除され、3件の商談が処理される
    expect(result.processedCount).toBe(3);
    expect(result.uniqueDealIds).toEqual(['DEAL-001', 'DEAL-002', 'DEAL-003']);
    expect(result.processedDeals).toHaveLength(3);
    
    // 処理対象となった商談レコードの検証
    const processedDealIds = result.processedDeals.map(
      (deal: { dealId: string }) => deal.dealId
    );
    expect(processedDealIds).toContain('DEAL-001');
    expect(processedDealIds).toContain('DEAL-002');
    expect(processedDealIds).toContain('DEAL-003');
    
    // 重複処理が行われていないことを確認（各dealの処理回数が1回）
    expect(result.eachDealProcessedOnce).toBe(true);
  });
});