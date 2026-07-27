import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-171: [edge] 顧客別商談進捗集計機能 - 交渉中ステータスの商談件数が0件のとき、その件数が0として集計される
  test('should aggregate customer deal progress with zero negotiation deals', async () => {
    const customerId = 'CUST-001';
    const customerName = 'Test Customer Inc.';
    
    const testCustomer = {
      customerId,
      customerName,
      email: 'contact@testcustomer.com',
      phone: '09012345678',
      registeredDate: '2024-01-01T00:00:00Z',
    };

    const testDeals = [
      {
        dealId: 'DEAL-001',
        customerId,
        dealName: 'Initial Contact Deal',
        status: 'initialContact',
        amount: 100000,
        createdDate: '2024-02-01T10:00:00Z',
      },
      {
        dealId: 'DEAL-002',
        customerId,
        dealName: 'Proposal In Progress Deal',
        status: 'proposalInProgress',
        amount: 250000,
        createdDate: '2024-02-05T14:30:00Z',
      },
      {
        dealId: 'DEAL-003',
        customerId,
        dealName: 'Won Deal',
        status: 'won',
        amount: 500000,
        createdDate: '2024-02-15T09:15:00Z',
      },
    ];

    const result = await aggregateDealProgressByCustomer(testCustomer, testDeals);

    expect(result.customerId).toBe('CUST-001');
    expect(result.customerName).toBe('Test Customer Inc.');
    expect(result.progressSummary.initialContact.dealCount).toBe(1);
    expect(result.progressSummary.initialContact.totalAmount).toBe(100000);
    expect(result.progressSummary.proposalInProgress.dealCount).toBe(1);
    expect(result.progressSummary.proposalInProgress.totalAmount).toBe(250000);
    expect(result.progressSummary.negotiationInProgress.dealCount).toBe(0);
    expect(result.progressSummary.negotiationInProgress.totalAmount).toBe(0);
    expect(result.progressSummary.won.dealCount).toBe(1);
    expect(result.progressSummary.won.totalAmount).toBe(500000);
    expect(result.progressSummary.lost.dealCount).toBe(0);
    expect(result.progressSummary.lost.totalAmount).toBe(0);
    expect(result.totalDealsCount).toBe(3);
    expect(result.totalAmount).toBe(850000);
  });
});