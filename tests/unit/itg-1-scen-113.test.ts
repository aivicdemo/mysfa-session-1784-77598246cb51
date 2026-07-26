import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { calculateMonthlySalesTotal } from '../../src/logic/it-1-3';

const fetchMock = require('jest-fetch-mock');

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-113
  test('当月売上集計機能 - 複数の商談から売上合計が正確に計算される', async () => {
    const deal_1 = {
      deal_id: 'DEAL001',
      customer_name: '顧客A',
      amount: 150000.50,
      status: '受注',
      deal_date: '2024-01-15T10:30:00Z',
    };

    const deal_2 = {
      deal_id: 'DEAL002',
      customer_name: '顧客B',
      amount: 250000.00,
      status: '受注',
      deal_date: '2024-01-20T14:45:00Z',
    };

    const deal_3 = {
      deal_id: 'DEAL003',
      customer_name: '顧客C',
      amount: 99999.75,
      status: '受注',
      deal_date: '2024-01-25T09:15:00Z',
    };

    const deals_array = [deal_1, deal_2, deal_3];
    const current_month = '2024-01';

    const expected_total_sales = 150000.50 + 250000.00 + 99999.75;

    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        deals: deals_array,
        month: current_month,
      }),
      { status: 200 }
    );

    const result = await calculateMonthlySalesTotal({
      month: current_month,
      deals: deals_array,
    });

    expect(result.total_sales_amount).toBe(500000.25);
    expect(result.deal_count).toBe(3);
    expect(result.month).toBe(current_month);
    expect(result.has_decimal_precision).toBe(true);
    expect(result.deals_included).toEqual([
      'DEAL001',
      'DEAL002',
      'DEAL003',
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});