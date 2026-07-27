import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-785
  test('請求対象データ抽出機能 - 金額が0円のデータが存在するとき、条件に合致すれば抽出される', () => {
    // テスト対象の請求対象データ抽出機能の初期化
    const extractionCriteria = {
      billingStatus: 'confirmed',
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-31T23:59:59Z'),
    };

    // テストデータ準備
    // 金額が0円かつ抽出条件に合致するレコード
    const billingRecordMatchingCriteria = {
      id: 'billing_001',
      customerId: 'customer_001',
      dealId: 'deal_001',
      amount: 0,
      billingStatus: 'confirmed',
      billingDate: new Date('2024-01-15T10:00:00Z'),
      itemDetails: [
        {
          itemId: 'item_001',
          description: 'Service A',
          quantity: 1,
          unitPrice: 0,
        },
      ],
    };

    // 金額が0円だが抽出条件に合致しないレコード（ステータスが'draft'）
    const billingRecordNotMatchingStatus = {
      id: 'billing_002',
      customerId: 'customer_002',
      dealId: 'deal_002',
      amount: 0,
      billingStatus: 'draft',
      billingDate: new Date('2024-01-20T10:00:00Z'),
      itemDetails: [
        {
          itemId: 'item_002',
          description: 'Service B',
          quantity: 1,
          unitPrice: 0,
        },
      ],
    };

    // 金額が0円だが抽出条件に合致しないレコード（日付が期間外）
    const billingRecordNotMatchingDateRange = {
      id: 'billing_003',
      customerId: 'customer_003',
      dealId: 'deal_003',
      amount: 0,
      billingStatus: 'confirmed',
      billingDate: new Date('2024-02-01T10:00:00Z'),
      itemDetails: [
        {
          itemId: 'item_003',
          description: 'Service C',
          quantity: 1,
          unitPrice: 0,
        },
      ],
    };

    // 金額が0でなく抽出条件に合致するレコード（参照用）
    const billingRecordWithNonZeroAmount = {
      id: 'billing_004',
      customerId: 'customer_004',
      dealId: 'deal_004',
      amount: 50000,
      billingStatus: 'confirmed',
      billingDate: new Date('2024-01-25T10:00:00Z'),
      itemDetails: [
        {
          itemId: 'item_004',
          description: 'Service D',
          quantity: 2,
          unitPrice: 25000,
        },
      ],
    };

    const allBillingRecords = [
      billingRecordMatchingCriteria,
      billingRecordNotMatchingStatus,
      billingRecordNotMatchingDateRange,
      billingRecordWithNonZeroAmount,
    ];

    // 請求対象データ抽出処理を実行
    const extractedData = extractBillingTargetData(allBillingRecords, extractionCriteria);

    // 期待結果検証
    // 金額が0円かつ抽出条件に合致するレコードが含まれていることを確認
    expect(extractedData).toContainEqual(expect.objectContaining({
      id: 'billing_001',
      amount: 0,
      billingStatus: 'confirmed',
    }));

    // 金額が0円であるが抽出条件に合致しないレコード（ステータス不一致）は含まれないことを確認
    expect(extractedData).not.toContainEqual(expect.objectContaining({
      id: 'billing_002',
    }));

    // 金額が0円であるが抽出条件に合致しないレコード（日付範囲外）は含まれないことを確認
    expect(extractedData).not.toContainEqual(expect.objectContaining({
      id: 'billing_003',
    }));

    // 金額が0でなく抽出条件に合致するレコードが含まれていることを確認
    expect(extractedData).toContainEqual(expect.objectContaining({
      id: 'billing_004',
      amount: 50000,
    }));

    // 抽出結果の件数確認（0円で条件一致1件 + 0円以外で条件一致1件）
    expect(extractedData).toHaveLength(2);
  });
});