import { validateBillingDetails } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-833
  test('請求対象データ妥当性検証機能 - 請求明細の数量が0のとき、該当データを不承認と判定する', () => {
    const billing_detail_input = {
      product_id: 'PROD-001',
      product_name: 'サンプル商品',
      unit_price: 10000,
      quantity: 0,
    };

    const result = validateBillingDetails(billing_detail_input);

    expect(result.validation_status).toBe('REJECTED');
    expect(result.error_code).toBe('QUANTITY_ZERO');
    expect(result.error_message).toBe('請求明細の数量は1以上である必要があります');
    expect(result.status).toBe('未承認');
  });
});