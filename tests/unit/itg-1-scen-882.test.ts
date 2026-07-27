import { validateDiscountCalculation } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-882
  test('請求書に割引が適用されている場合、割引後の合計が正確に計算される', () => {
    const invoice_object = {
      items: [
        {
          product_name: 'productA',
          unit_price: 1000,
          quantity: 5,
        },
        {
          product_name: 'productB',
          unit_price: 2000,
          quantity: 3,
        },
      ],
      discount_rate: 10,
    };

    const result = validateDiscountCalculation(invoice_object);

    expect(result.subtotal).toBe(11000);
    expect(result.discount_amount).toBe(1100);
    expect(result.discounted_total).toBe(9900);
    expect(result.is_valid).toBe(true);
    expect(result.status).toBe('VALID');
    expect(result.error_messages).toEqual([]);
  });
});