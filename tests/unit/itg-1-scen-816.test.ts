import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-816
  test('請求対象データ妥当性検証機能 - 請求期日が過去日のとき、該当データを不承認と判定する', () => {
    const today = new Date('2024-01-15T00:00:00Z');
    const pastDueDate = new Date('2023-12-16T00:00:00Z');

    const invoiceData = {
      customerId: 'CUST-001',
      invoiceAmount: 100000,
      invoiceContent: 'Test Product',
      dueDate: pastDueDate,
    };

    const result = validateInvoiceData(invoiceData, today);

    expect(result.isApproved).toBe(false);
    expect(result.errorMessage).toMatch(/請求期日が過去日|請求期日は本日以降/);
  });
});