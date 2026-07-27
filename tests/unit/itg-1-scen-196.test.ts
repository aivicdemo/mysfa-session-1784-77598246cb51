import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-196
  test('ステータス値が定義されていない商談が含まれるとき、エラーまたは除外される', () => {
    const testDeals = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-A',
        status: '初期接触',
        amount: 1000000,
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-A',
        status: null,
        amount: 500000,
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-A',
        status: '提案中',
        amount: 800000,
      },
    ];

    const validStatuses = ['初期接触', '提案中', '交渉中', '受注', '失注'];

    let errorThrown = false;
    let errorMessage = '';
    let result = null;

    try {
      result = aggregateDealProgressByCustomer(testDeals, validStatuses);
    } catch (error) {
      errorThrown = true;
      errorMessage = (error as Error).message;
    }

    if (errorThrown) {
      expect(errorMessage).toMatch(/ステータスが定義されていない商談/);
    } else {
      expect(result).toBeDefined();
      expect(result.customerId).toBe('CUST-A');
      expect(result.totalDeals).toBe(2);
      expect(result.deals).toHaveLength(2);
      expect(result.deals.some((d: any) => d.dealId === 'DEAL-001')).toBe(true);
      expect(result.deals.some((d: any) => d.dealId === 'DEAL-003')).toBe(true);
      expect(
        result.deals.some((d: any) => d.dealId === 'DEAL-002')
      ).toBe(false);
      expect(result.totalAmount).toBe(1800000);
      expect(result.dealsByStatus['初期接触']).toEqual({
        count: 1,
        totalAmount: 1000000,
      });
      expect(result.dealsByStatus['提案中']).toEqual({
        count: 1,
        totalAmount: 800000,
      });
      expect(result.dealsByStatus['交渉中']).toEqual({
        count: 0,
        totalAmount: 0,
      });
      expect(result.dealsByStatus['受注']).toEqual({
        count: 0,
        totalAmount: 0,
      });
      expect(result.dealsByStatus['失注']).toEqual({
        count: 0,
        totalAmount: 0,
      });
    }
  });
});