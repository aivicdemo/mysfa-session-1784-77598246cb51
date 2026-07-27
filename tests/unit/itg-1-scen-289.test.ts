import { detectDuplicateInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-289: 同一商談に紐付く重複請求書がすべて検出される', () => {
    // Arrange: テストデータの準備
    const invoices = [
      {
        invoiceId: 'INV-001',
        dealId: 'DEAL-001',
        amount: 100000,
        issuedDate: '2024-01-15',
      },
      {
        invoiceId: 'INV-002',
        dealId: 'DEAL-001',
        amount: 100000,
        issuedDate: '2024-01-16',
      },
      {
        invoiceId: 'INV-003',
        dealId: 'DEAL-001',
        amount: 100000,
        issuedDate: '2024-01-17',
      },
      {
        invoiceId: 'INV-004',
        dealId: 'DEAL-002',
        amount: 50000,
        issuedDate: '2024-01-15',
      },
      {
        invoiceId: 'INV-005',
        dealId: 'DEAL-002',
        amount: 50000,
        issuedDate: '2024-01-16',
      },
    ];

    // Act: 重複検出ロジックを呼び出す
    const result = detectDuplicateInvoices(invoices);

    // Assert: 期待結果を検証
    // 1) 重複グループ1: dealId='DEAL-001'に属する3件が重複として検出される
    expect(result.duplicateGroups).toHaveLength(1);

    const duplicateGroup = result.duplicateGroups[0];
    expect(duplicateGroup.dealId).toBe('DEAL-001');
    expect(duplicateGroup.invoiceIds).toHaveLength(3);
    expect(duplicateGroup.invoiceIds).toEqual(['INV-001', 'INV-002', 'INV-003']);

    // 2) dealId='DEAL-002'に属する2件は重複と判定されない
    const nonDuplicateInvoices = result.nonDuplicateInvoices;
    expect(nonDuplicateInvoices).toHaveLength(2);
    expect(nonDuplicateInvoices.map((inv) => inv.invoiceId)).toEqual([
      'INV-004',
      'INV-005',
    ]);

    // 3) 検出された重複の総数は1グループ（3件の重複セット）
    expect(result.totalDuplicateGroups).toBe(1);
    expect(result.totalDuplicateCount).toBe(3);
  });
});