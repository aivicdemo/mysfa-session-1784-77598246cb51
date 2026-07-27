import { reconcileDealAndInvoiceAmount } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-739: 請求書の金額が商談金額と一致する場合、金額照合は成功する', () => {
    // Arrange: テスト用の商談・請求書データを準備
    const dealData = {
      dealId: 'DEAL-001',
      dealAmount: 150000,
      dealStatus: '受注',
      customerId: 'CUST-001',
      customerName: 'テスト顧客',
    };

    const invoiceData = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      invoiceAmount: 150000,
      invoiceIssuedDate: new Date('2024-01-15T09:00:00Z'),
      invoiceStatus: '発行済',
    };

    const expectedResult = {
      status: 'success',
      message: '商談金額と請求書金額が一致しました。金額: 150,000円',
      dealStatus: '照合完了',
      matchedAmount: 150000,
      amountDifference: 0,
    };

    // Act: 金額照合機能を実行
    const reconciliationResult = reconcileDealAndInvoiceAmount(dealData, invoiceData);

    // Assert: 照合結果を検証
    expect(reconciliationResult.status).toBe('success');
    expect(reconciliationResult.message).toBe('商談金額と請求書金額が一致しました。金額: 150,000円');
    expect(reconciliationResult.dealStatus).toBe('照合完了');
    expect(reconciliationResult.matchedAmount).toBe(150000);
    expect(reconciliationResult.amountDifference).toBe(0);
  });
});