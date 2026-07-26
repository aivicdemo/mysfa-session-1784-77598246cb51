import { classifyDealsByCustomerAndStatus } from '../../src/logic/it-1';

describe('顧客別商談進捗分類機能', () => {
  test('SCEN-122: 1つのステータスのみを持つ商談が正確に分類される', () => {
    // Arrange: テストデータを準備
    const customerId = 'CUST-001';
    const dealId = 'DEAL-001';
    const dealAmount = 50000;
    const dealStatus = '提案中';

    const inputDeals = [
      {
        id: dealId,
        customerId: customerId,
        customerName: 'テスト顧客A',
        status: dealStatus,
        amount: dealAmount,
      },
    ];

    // Act: 顧客別商談進捗分類処理を実行
    const classificationResult = classifyDealsByCustomerAndStatus(inputDeals);

    // Assert: 分類結果を検証

    // 1. 顧客がマップキーとして存在すること
    expect(Object.keys(classificationResult)).toContain(customerId);

    // 2. 該当顧客の分類結果が存在すること
    const customerClassification = classificationResult[customerId];
    expect(customerClassification).toBeDefined();

    // 3. 「提案中」ステータスカテゴリに該当商談が正確に分類されていること
    expect(customerClassification['提案中']).toBeDefined();
    expect(customerClassification['提案中'].deals).toHaveLength(1);
    expect(customerClassification['提案中'].deals[0].id).toBe(dealId);
    expect(customerClassification['提案中'].deals[0].amount).toBe(dealAmount);
    expect(customerClassification['提案中'].totalAmount).toBe(dealAmount);
    expect(customerClassification['提案中'].count).toBe(1);

    // 4. 他のステータスカテゴリには同一商談が表示されていないこと
    const statusCategories = ['初期接触', '交渉中', '成約', '失注'];
    statusCategories.forEach((status) => {
      if (customerClassification[status]) {
        const isContained = customerClassification[status].deals.some(
          (deal: any) => deal.id === dealId
        );
        expect(isContained).toBe(false);
      }
    });

    // 5. 分類結果に複数ステータスが混在していないこと
    const populatedStatuses = Object.keys(customerClassification).filter(
      (status) => customerClassification[status].count > 0
    );
    expect(populatedStatuses).toHaveLength(1);
    expect(populatedStatuses[0]).toBe('提案中');
  });
});