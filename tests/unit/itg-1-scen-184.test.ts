import { aggregateCustomerDealProgress } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-184: 顧客別商談進捗集計機能 - 提案中ステータスの商談が1件で金額が0円を超えるとき、その金額が正確に集計される', () => {
    // Arrange
    const customerId = 'CUST-001';
    const dealId = 'DEAL-001';
    const dealStatus = '提案中';
    const dealAmount = 150000;

    const deals = [
      {
        dealId: dealId,
        customerId: customerId,
        status: dealStatus,
        amount: dealAmount,
      },
    ];

    // Act
    const aggregationResult = aggregateCustomerDealProgress(deals);

    // Assert
    expect(aggregationResult).toEqual({
      customerId: customerId,
      statusBreakdown: {
        初期接触: {
          count: 0,
          totalAmount: 0,
        },
        提案中: {
          count: 1,
          totalAmount: 150000,
        },
        交渉中: {
          count: 0,
          totalAmount: 0,
        },
        受注: {
          count: 0,
          totalAmount: 0,
        },
        失注: {
          count: 0,
          totalAmount: 0,
        },
      },
    });

    expect(aggregationResult.statusBreakdown['提案中'].totalAmount).toBe(150000);
    expect(aggregationResult.statusBreakdown['提案中'].count).toBe(1);
  });
});