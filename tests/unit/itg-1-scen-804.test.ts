import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-804: 請求対象データ妥当性検証機能 - 請求期日が欠けているときは不承認と判定する', () => {
    // Arrange: 請求データオブジェクトを構築（請求期日なし）
    const invoiceData = {
      customerId: 'CUST-001',
      invoiceAmount: 150000,
      invoiceStartDate: '2024-04-01',
      invoiceDueDate: null,
    };

    // Act: 妥当性検証関数を実行
    const result = validateInvoiceData(invoiceData);

    // Assert: 不承認判定と必須項目エラーを検証
    expect(result.isApproved).toBe(false);
    expect(result.status).toBe('検証失敗');
    expect(result.errorReason).toMatch(/請求期日/);
  });
});