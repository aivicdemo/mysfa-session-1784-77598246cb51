import { updateDealStatusToClosedWithValidation } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-143: [edge] 商談ステータス更新時の必須項目チェックと請求データ紐付け
  test('商談ステータスを「成約」に更新する際、明細データが1行以上存在する場合、必須項目チェックをクリアして更新が許可される', () => {
    // Arrange: テスト用商談データ（ステータス：『交渉中』）を準備
    const deal_input = {
      deal_id: 'DEAL-20240115-001',
      status: '交渉中',
      customer_id: 'CUST-20240115-001',
      customer_name: 'テスト顧客太郎',
      transaction_amount: 1500000,
      contract_date: '2024-01-15',
      details: [
        {
          detail_id: 'DETAIL-20240115-001',
          product_name: '商品A',
          quantity: 2,
          unit_price: 500000,
          line_amount: 1000000,
        },
        {
          detail_id: 'DETAIL-20240115-002',
          product_name: '商品B',
          quantity: 1,
          unit_price: 500000,
          line_amount: 500000,
        },
      ],
    };

    // Act: 商談ステータスを『成約』に更新し、必須項目チェック実行
    const result = updateDealStatusToClosedWithValidation(deal_input);

    // Assert: 更新処理が完了し、商談ステータスが『成約』に更新されたことを確認
    expect(result.status).toBe('成約');
    expect(result.deal_id).toBe('DEAL-20240115-001');

    // Assert: 必須項目チェックがすべてクリアされたことを確認
    expect(result.validation_passed).toBe(true);
    expect(result.customer_name).toBe('テスト顧客太郎');
    expect(result.transaction_amount).toBe(1500000);
    expect(result.contract_date).toBe('2024-01-15');

    // Assert: 請求明細データが正しく紐付けられていることを確認
    expect(result.details).toHaveLength(2);
    expect(result.details[0].detail_id).toBe('DETAIL-20240115-001');
    expect(result.details[0].line_amount).toBe(1000000);
    expect(result.details[1].detail_id).toBe('DETAIL-20240115-002');
    expect(result.details[1].line_amount).toBe(500000);

    // Assert: 請求金額の合計が正しく計算されていることを確認
    expect(result.total_billing_amount).toBe(1500000);

    // Assert: エラーメッセージが表示されていないことを確認
    expect(result.error_message).toBeUndefined();
    expect(result.validation_errors).toHaveLength(0);

    // Assert: 請求データが当該商談に紐付けられていることを確認
    expect(result.is_billing_linked).toBe(true);
    expect(result.billing_status).toBe('紐付け完了');
  });

  // エッジケース: 明細データが0行の場合、ステータス更新が拒否される
  test('明細データが0行の場合、ステータス更新が拒否される', () => {
    const deal_input = {
      deal_id: 'DEAL-20240115-002',
      status: '交渉中',
      customer_id: 'CUST-20240115-002',
      customer_name: 'テスト顧客二郎',
      transaction_amount: 500000,
      contract_date: '2024-01-15',
      details: [],
    };

    expect(() => {
      updateDealStatusToClosedWithValidation(deal_input);
    }).toThrow(/明細データ/);
  });

  // エッジケース: 必須項目の顧客名が空の場合、ステータス更新が拒否される
  test('必須項目の顧客名が空の場合、ステータス更新が拒否される', () => {
    const deal_input = {
      deal_id: 'DEAL-20240115-003',
      status: '交渉中',
      customer_id: 'CUST-20240115-003',
      customer_name: '',
      transaction_amount: 1000000,
      contract_date: '2024-01-15',
      details: [
        {
          detail_id: 'DETAIL-20240115-003',
          product_name: '商品C',
          quantity: 1,
          unit_price: 1000000,
          line_amount: 1000000,
        },
      ],
    };

    expect(() => {
      updateDealStatusToClosedWithValidation(deal_input);
    }).toThrow(/顧客名/);
  });

  // エッジケース: 取引金額が0以下の場合、ステータス更新が拒否される
  test('取引金額が0以下の場合、ステータス更新が拒否される', () => {
    const deal_input = {
      deal_id: 'DEAL-20240115-004',
      status: '交渉中',
      customer_id: 'CUST-20240115-004',
      customer_name: 'テスト顧客三郎',
      transaction_amount: 0,
      contract_date: '2024-01-15',
      details: [
        {
          detail_id: 'DETAIL-20240115-004',
          product_name: '商品D',
          quantity: 1,
          unit_price: 0,
          line_amount: 0,
        },
      ],
    };

    expect(() => {
      updateDealStatusToClosedWithValidation(deal_input);
    }).toThrow(/取引金額/);
  });

  // エッジケース: 成約日が空の場合、ステータス更新が拒否される
  test('成約日が空の場合、ステータス更新が拒否される', () => {
    const deal_input = {
      deal_id: 'DEAL-20240115-005',
      status: '交渉中',
      customer_id: 'CUST-20240115-005',
      customer_name: 'テスト顧客四郎',
      transaction_amount: 1200000,
      contract_date: '',
      details: [
        {
          detail_id: 'DETAIL-20240115-005',
          product_name: '商品E',
          quantity: 1,
          unit_price: 1200000,
          line_amount: 1200000,
        },
      ],
    };

    expect(() => {
      updateDealStatusToClosedWithValidation(deal_input);
    }).toThrow(/成約日/);
  });

  // エッジケース: 複数明細の合計金額が取引金額と一致しない場合、ステータス更新が拒否される
  test('複数明細の合計金額が取引金額と一致しない場合、ステータス更新が拒否される', () => {
    const deal_input = {
      deal_id: 'DEAL-20240115-006',
      status: '交渉中',
      customer_id: 'CUST-20240115-006',
      customer_name: 'テスト顧客五郎',
      transaction_amount: 2000000,
      contract_date: '2024-01-15',
      details: [
        {
          detail_id: 'DETAIL-20240115-006',
          product_name: '商品F',
          quantity: 1,
          unit_price: 1000000,
          line_amount: 1000000,
        },
        {
          detail_id: 'DETAIL-20240115-007',
          product_name: '商品G',
          quantity: 1,
          unit_price: 500000,
          line_amount: 500000,
        },
      ],
    };

    expect(() => {
      updateDealStatusToClosedWithValidation(deal_input);
    }).toThrow(/金額不一致/);
  });
});