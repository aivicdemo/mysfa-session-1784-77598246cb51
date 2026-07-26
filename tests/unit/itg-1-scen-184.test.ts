import { validateDealStatusAndBillingData } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-184
  test('支払い予定日が過去日付である場合、警告またはエラーが適切に返される', () => {
    const pastPaymentDueDate = new Date('2020-01-01T00:00:00Z');
    const currentDate = new Date('2024-12-15T10:00:00Z');
    
    const dealData = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      dealAmount: 500000,
      dealStatus: 'contract',
      billingData: {
        paymentDueDate: pastPaymentDueDate,
        invoiceAmount: 500000,
        invoiceDate: new Date('2024-12-15T09:00:00Z'),
      },
      currentDate: currentDate,
    };

    const result = validateDealStatusAndBillingData(dealData);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe(400);
    expect(result.errorMessage).toMatch(/支払い予定日/);
    expect(result.dealStatusUpdated).toBe(false);
    expect(result.billingDataSaved).toBe(false);
  });
});