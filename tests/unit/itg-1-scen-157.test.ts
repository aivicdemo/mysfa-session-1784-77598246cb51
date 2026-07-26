import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { aggregateMonthlySalesAndBillingStatus } from '../../src/logic/it-1-3';

const fetchMock = require('jest-fetch-mock');

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-157
  test('月次決算対象期間内のすべての成約商談から売上実績が正しく集計される', async () => {
    const targetStartDate = '2024-01-01';
    const targetEndDate = '2024-01-31';
    const userId = 'admin_user_001';
    const userRole = 'admin';

    const mockDeals = [
      {
        dealId: 'deal_A',
        customerId: 'cust_001',
        customerName: '顧客A',
        dealAmount: 1000000,
        status: '受注',
        contractDate: '2024-01-10',
        invoiceIssuedDate: '2024-01-15',
        invoiceAmount: 1000000,
      },
      {
        dealId: 'deal_B',
        customerId: 'cust_002',
        customerName: '顧客B',
        dealAmount: 500000,
        status: '受注',
        contractDate: '2024-01-15',
        invoiceIssuedDate: '2024-01-20',
        invoiceAmount: 500000,
      },
      {
        dealId: 'deal_C',
        customerId: 'cust_003',
        customerName: '顧客C',
        dealAmount: 750000,
        status: '受注',
        contractDate: '2024-01-20',
        invoiceIssuedDate: '2024-01-25',
        invoiceAmount: 750000,
      },
      {
        dealId: 'deal_D',
        customerId: 'cust_004',
        customerName: '顧客D',
        dealAmount: 300000,
        status: '受注',
        contractDate: '2024-02-05',
        invoiceIssuedDate: '2024-02-10',
        invoiceAmount: 300000,
      },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockDeals), { status: 200 });

    const result = await aggregateMonthlySalesAndBillingStatus({
      startDate: targetStartDate,
      endDate: targetEndDate,
      userId: userId,
      userRole: userRole,
    });

    expect(result.totalSalesAmount).toBe(2250000);
    expect(result.contractedDealsCount).toBe(3);
    expect(result.aggregationPeriod).toEqual({
      start: targetStartDate,
      end: targetEndDate,
    });
    expect(result.deals).toHaveLength(3);

    const dealIds = result.deals.map((d: { dealId: string }) => d.dealId);
    expect(dealIds).toContain('deal_A');
    expect(dealIds).toContain('deal_B');
    expect(dealIds).toContain('deal_C');
    expect(dealIds).not.toContain('deal_D');

    const dealA = result.deals.find((d: { dealId: string }) => d.dealId === 'deal_A');
    expect(dealA.dealAmount).toBe(1000000);
    expect(dealA.invoiceAmount).toBe(1000000);
    expect(dealA.invoiceIssuedDate).toBe('2024-01-15');

    const dealB = result.deals.find((d: { dealId: string }) => d.dealId === 'deal_B');
    expect(dealB.dealAmount).toBe(500000);
    expect(dealB.invoiceAmount).toBe(500000);

    const dealC = result.deals.find((d: { dealId: string }) => d.dealId === 'deal_C');
    expect(dealC.dealAmount).toBe(750000);
    expect(dealC.invoiceAmount).toBe(750000);

    expect(result.csvExport).toBeDefined();
    expect(result.csvExport).toContain('deal_A');
    expect(result.csvExport).toContain('deal_B');
    expect(result.csvExport).toContain('deal_C');
    expect(result.csvExport).not.toContain('deal_D');

    const lines = result.csvExport.split('\n').filter((line: string) => line.trim());
    expect(lines.length).toBeGreaterThanOrEqual(4);

    const csvTotalAmount = result.csvExport.match(/2250000/);
    expect(csvTotalAmount).not.toBeNull();

    expect(result.status).toBe('success');
    expect(result.message).toBe('');
  });
});