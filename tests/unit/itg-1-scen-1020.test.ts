import { fetchAnnualCostData } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-1020
  test('Salesforce Metadata API連携 - fetchAnnualCostDataが成功応答を受けた場合、ライセンス契約の年間費用・更新日・割引情報が取得される', async () => {
    const assumedAnnualCost = 1200000;
    const assumedRenewalDate = '2024-12-31T00:00:00Z';
    const assumedDiscountRate = 15;
    const assumedDiscountPeriodStart = '2024-01-01T00:00:00Z';
    const assumedDiscountPeriodEnd = '2024-12-31T00:00:00Z';

    const mockSalesforceDataSource = {
      fetchAnnualCostData: jest.fn().mockResolvedValue({
        annualCost: assumedAnnualCost,
        renewalDate: assumedRenewalDate,
        discountRate: assumedDiscountRate,
        discountPeriod: {
          start: assumedDiscountPeriodStart,
          end: assumedDiscountPeriodEnd,
        },
      }),
    };

    const result = await fetchAnnualCostData(mockSalesforceDataSource);

    expect(result).toEqual({
      annualCost: assumedAnnualCost,
      renewalDate: assumedRenewalDate,
      discountRate: assumedDiscountRate,
      discountPeriod: {
        start: assumedDiscountPeriodStart,
        end: assumedDiscountPeriodEnd,
      },
      cached: true,
      lastUpdated: expect.any(String),
    });

    expect(typeof result.annualCost).toBe('number');
    expect(result.annualCost).toBe(assumedAnnualCost);

    expect(result.renewalDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(result.renewalDate).toBe(assumedRenewalDate);

    expect(typeof result.discountRate).toBe('number');
    expect(result.discountRate).toBe(assumedDiscountRate);

    expect(result.discountPeriod.start).toBe(assumedDiscountPeriodStart);
    expect(result.discountPeriod.end).toBe(assumedDiscountPeriodEnd);

    expect(result.cached).toBe(true);
    expect(result.lastUpdated).toBeDefined();

    expect(mockSalesforceDataSource.fetchAnnualCostData).toHaveBeenCalledTimes(1);
  });
});