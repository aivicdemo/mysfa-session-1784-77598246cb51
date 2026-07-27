import { validateInvoiceData } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  test('SCEN-822: 請求対象データ妥当性検証機能 - 商談の契約金額と請求金額が異なるとき、該当データを不承認と判定する', () => {
    // Arrange
    const dealId = 'DEAL-001';
    const contractAmount = 500000;
    const invoiceAmount = 450000;

    const invoiceData = {
      dealId: dealId,
      contractAmount: contractAmount,
      invoiceAmount: invoiceAmount,
      customerId: 'CUST-001',
      invoiceDate: new Date('2024-01-15T11:00:00Z'),
      dueDate: new Date('2024-02-15T11:00:00Z'),
    };

    // Act
    const validationResult = validateInvoiceData(invoiceData);

    // Assert
    expect(validationResult.isApproved).toBe(false);
    expect(validationResult.status).toBe('不承認');
    expect(validationResult.rejectionReason).toMatch(/契約金額と請求金額が一致しません/);
    expect(validationResult.dealId).toBe(dealId);
  });
});