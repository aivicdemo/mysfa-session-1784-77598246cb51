import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  updateDealStatusToContracted,
} from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-140: [normal] 商談ステータス更新時の必須項目チェックと請求データ紐付け
  test('商談ステータスを成約に更新する際、顧客情報・金額・明細データがすべて入力済みの場合、ステータス更新が許可され請求データが自動紐付けされる', () => {
    const dealInput = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-12345',
      customer_name: '株式会社テストカンパニー',
      amount: 1500000,
      currency: 'JPY',
      line_items: [
        {
          item_id: 'ITEM-001',
          product_name: 'システム構築サービス',
          quantity: 1,
          unit_price: 1000000,
          subtotal: 1000000,
          tax_rate: 0.1,
        },
        {
          item_id: 'ITEM-002',
          product_name: 'サポート・運用サービス',
          quantity: 1,
          unit_price: 500000,
          subtotal: 500000,
          tax_rate: 0.1,
        },
      ],
      status: '交渉中',
      expected_billing_date: '2024-02-15',
      billing_type: '納期後',
    };

    const result = updateDealStatusToContracted(dealInput);

    // ステータスが『成約』に正常に更新されたことを確認
    expect(result.status).toBe('成約');

    // 顧客情報が正確に保持されていることを確認
    expect(result.customer_id).toBe('CUST-12345');
    expect(result.customer_name).toBe('株式会社テストカンパニー');

    // 金額が正確に保持されていることを確認
    expect(result.amount).toBe(1500000);
    expect(result.currency).toBe('JPY');

    // 明細データが正確に保持されていることを確認
    expect(result.line_items).toHaveLength(2);
    expect(result.line_items[0].item_id).toBe('ITEM-001');
    expect(result.line_items[0].product_name).toBe('システム構築サービス');
    expect(result.line_items[0].quantity).toBe(1);
    expect(result.line_items[0].unit_price).toBe(1000000);
    expect(result.line_items[0].subtotal).toBe(1000000);
    expect(result.line_items[0].tax_rate).toBe(0.1);
    expect(result.line_items[1].item_id).toBe('ITEM-002');
    expect(result.line_items[1].product_name).toBe('サポート・運用サービス');
    expect(result.line_items[1].quantity).toBe(1);
    expect(result.line_items[1].unit_price).toBe(500000);
    expect(result.line_items[1].subtotal).toBe(500000);
    expect(result.line_items[1].tax_rate).toBe(0.1);

    // 請求データが自動的に生成・紐付けされたことを確認
    expect(result.billing_data).toBeDefined();
    expect(result.billing_data.billing_id).toBeDefined();
    expect(result.billing_data.customer_id).toBe('CUST-12345');
    expect(result.billing_data.customer_name).toBe('株式会社テストカンパニー');

    // 請求金額が合計金額に基づいて正確に計算されたことを確認
    // 小計: 1500000、税金: 1000000 * 0.1 + 500000 * 0.1 = 150000
    // 合計: 1500000 + 150000 = 1650000
    expect(result.billing_data.subtotal).toBe(1500000);
    expect(result.billing_data.tax_amount).toBe(150000);
    expect(result.billing_data.total_amount).toBe(1650000);

    // 請求明細が正確に生成されたことを確認
    expect(result.billing_data.billing_line_items).toHaveLength(2);
    expect(result.billing_data.billing_line_items[0].product_name).toBe(
      'システム構築サービス'
    );
    expect(result.billing_data.billing_line_items[0].quantity).toBe(1);
    expect(result.billing_data.billing_line_items[0].unit_price).toBe(1000000);
    expect(result.billing_data.billing_line_items[0].line_amount).toBe(1000000);
    expect(result.billing_data.billing_line_items[1].product_name).toBe(
      'サポート・運用サービス'
    );
    expect(result.billing_data.billing_line_items[1].quantity).toBe(1);
    expect(result.billing_data.billing_line_items[1].unit_price).toBe(500000);
    expect(result.billing_data.billing_line_items[1].line_amount).toBe(500000);

    // 請求タイプが正確に紐付けられたことを確認
    expect(result.billing_data.billing_type).toBe('納期後');

    // 請求発行予定日が正確に紐付けられたことを確認
    expect(result.billing_data.expected_billing_date).toBe('2024-02-15');

    // エラーフラグが立っていないことを確認
    expect(result.error).toBeUndefined();

    // ステータス履歴が記録されていることを確認
    expect(result.status_history).toBeDefined();
    expect(result.status_history.length).toBeGreaterThan(0);
    const latest_status_record = result.status_history[
      result.status_history.length - 1
    ];
    expect(latest_status_record.from_status).toBe('交渉中');
    expect(latest_status_record.to_status).toBe('成約');
    expect(latest_status_record.updated_at).toBeDefined();
  });

  // 補足: 顧客情報が不足している場合
  test('顧客情報が不足している場合、ステータス更新が拒否される', () => {
    const dealInput = {
      deal_id: 'DEAL-002',
      customer_id: '',
      customer_name: '',
      amount: 1500000,
      currency: 'JPY',
      line_items: [
        {
          item_id: 'ITEM-003',
          product_name: 'テスト商品',
          quantity: 1,
          unit_price: 1500000,
          subtotal: 1500000,
          tax_rate: 0.1,
        },
      ],
      status: '交渉中',
      expected_billing_date: '2024-02-15',
      billing_type: '納期後',
    };

    expect(() => updateDealStatusToContracted(dealInput)).toThrow(/顧客情報/);
  });

  // 補足: 金額が不足している場合
  test('金額が不足している場合、ステータス更新が拒否される', () => {
    const dealInput = {
      deal_id: 'DEAL-003',
      customer_id: 'CUST-12346',
      customer_name: '株式会社テストカンパニー2',
      amount: 0,
      currency: 'JPY',
      line_items: [
        {
          item_id: 'ITEM-004',
          product_name: 'テスト商品',
          quantity: 1,
          unit_price: 0,
          subtotal: 0,
          tax_rate: 0.1,
        },
      ],
      status: '交渉中',
      expected_billing_date: '2024-02-15',
      billing_type: '納期後',
    };

    expect(() => updateDealStatusToContracted(dealInput)).toThrow(/金額/);
  });

  // 補足: 明細データが不足している場合
  test('明細データが不足している場合、ステータス更新が拒否される', () => {
    const dealInput = {
      deal_id: 'DEAL-004',
      customer_id: 'CUST-12347',
      customer_name: '株式会社テストカンパニー3',
      amount: 1500000,
      currency: 'JPY',
      line_items: [],
      status: '交渉中',
      expected_billing_date: '2024-02-15',
      billing_type: '納期後',
    };

    expect(() => updateDealStatusToContracted(dealInput)).toThrow(/明細/);
  });
});