import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-243
  test('請求対象データ抽出機能 - 金額条件が0円または負の値の場合の抽出が正しく処理される', () => {
    // ========== ハッピーパス: 金額条件が0円の場合 ==========
    const billingData_zero = [
      {
        deal_id: 'D001',
        customer_id: 'C001',
        customer_name: '顧客A',
        amount: 0,
        status: '受注',
        billing_date: '2024-01-15',
      },
      {
        deal_id: 'D002',
        customer_id: 'C002',
        customer_name: '顧客B',
        amount: 0,
        status: '受注',
        billing_date: '2024-01-20',
      },
      {
        deal_id: 'D003',
        customer_id: 'C003',
        customer_name: '顧客C',
        amount: 50000,
        status: '受注',
        billing_date: '2024-01-25',
      },
    ];

    const result_zero = extractBillingTargetData({
      billing_data: billingData_zero,
      min_amount: 0,
      max_amount: 0,
      status_filter: '受注',
    });

    // 金額条件が0円の場合、0円の請求対象データが正しく抽出される
    expect(result_zero).toEqual({
      extracted_records: [
        {
          deal_id: 'D001',
          customer_id: 'C001',
          customer_name: '顧客A',
          amount: 0,
          status: '受注',
          billing_date: '2024-01-15',
        },
        {
          deal_id: 'D002',
          customer_id: 'C002',
          customer_name: '顧客B',
          amount: 0,
          status: '受注',
          billing_date: '2024-01-20',
        },
      ],
      total_count: 2,
      validation_status: 'success',
    });

    // ========== 境界値テスト: 金額範囲が0～0の場合 ==========
    const result_zero_range = extractBillingTargetData({
      billing_data: billingData_zero,
      min_amount: 0,
      max_amount: 0,
      status_filter: '受注',
    });

    expect(result_zero_range.total_count).toBe(2);
    expect(result_zero_range.validation_status).toBe('success');

    // ========== エラーケース: 負の値が入力された場合 ==========
    expect(() =>
      extractBillingTargetData({
        billing_data: billingData_zero,
        min_amount: -1000,
        max_amount: 0,
        status_filter: '受注',
      })
    ).toThrow(/金額/);

    // ========== エラーケース: 最大金額が負の値の場合 ==========
    expect(() =>
      extractBillingTargetData({
        billing_data: billingData_zero,
        min_amount: 0,
        max_amount: -1000,
        status_filter: '受注',
      })
    ).toThrow(/金額/);

    // ========== エラーケース: 金額条件が逆転している場合 ==========
    expect(() =>
      extractBillingTargetData({
        billing_data: billingData_zero,
        min_amount: 100000,
        max_amount: 50000,
        status_filter: '受注',
      })
    ).toThrow(/金額/);

    // ========== ハッピーパス: 金額範囲が0～正の値の場合 ==========
    const result_zero_to_positive = extractBillingTargetData({
      billing_data: billingData_zero,
      min_amount: 0,
      max_amount: 50000,
      status_filter: '受注',
    });

    // 0円と50000円の両方が抽出される
    expect(result_zero_to_positive.total_count).toBe(3);
    expect(result_zero_to_positive.validation_status).toBe('success');
    expect(result_zero_to_positive.extracted_records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deal_id: 'D001',
          amount: 0,
        }),
        expect.objectContaining({
          deal_id: 'D002',
          amount: 0,
        }),
        expect.objectContaining({
          deal_id: 'D003',
          amount: 50000,
        }),
      ])
    );

    // ========== ハッピーパス: 空の請求データでの抽出 ==========
    const result_empty = extractBillingTargetData({
      billing_data: [],
      min_amount: 0,
      max_amount: 0,
      status_filter: '受注',
    });

    expect(result_empty.total_count).toBe(0);
    expect(result_empty.validation_status).toBe('success');
    expect(result_empty.extracted_records).toEqual([]);

    // ========== ハッピーパス: ステータスフィルタリング付きの0円抽出 ==========
    const billingData_mixed_status = [
      {
        deal_id: 'D001',
        customer_id: 'C001',
        customer_name: '顧客A',
        amount: 0,
        status: '受注',
        billing_date: '2024-01-15',
      },
      {
        deal_id: 'D002',
        customer_id: 'C002',
        customer_name: '顧客B',
        amount: 0,
        status: '提案中',
        billing_date: '2024-01-20',
      },
    ];

    const result_status_filter = extractBillingTargetData({
      billing_data: billingData_mixed_status,
      min_amount: 0,
      max_amount: 0,
      status_filter: '受注',
    });

    // ステータスが「受注」の0円データのみ抽出される
    expect(result_status_filter.total_count).toBe(1);
    expect(result_status_filter.extracted_records[0].deal_id).toBe('D001');
  });
});