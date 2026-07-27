import { updateDelayedDealStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-673
  test('遅延案件の対応完了ステータスを「完了」に更新するとき、ステータスが「完了」に更新される', () => {
    const delayedDealId = 'DEAL-20240415-001';
    const customerId = 'CUST-2024-00123';
    const customerName = 'テスト顧客株式会社';
    const dealAmount = 500000;
    const currentStatus = 'delayed';
    const expectedStatus = 'completed';

    const delayedDealData = {
      dealId: delayedDealId,
      customerId: customerId,
      customerName: customerName,
      amount: dealAmount,
      status: currentStatus,
      invoiceIssuedDate: '2024-04-10',
      expectedBillingDate: '2024-04-15',
      delayedReason: '顧客対応未完了',
      updatedAt: '2024-04-20T09:30:00Z',
    };

    const result = updateDelayedDealStatus(delayedDealData, expectedStatus);

    expect(result.status).toBe(expectedStatus);
    expect(result.dealId).toBe(delayedDealId);
    expect(result.customerId).toBe(customerId);
    expect(result.amount).toBe(dealAmount);
    expect(result.completedAt).toBeDefined();
  });
});