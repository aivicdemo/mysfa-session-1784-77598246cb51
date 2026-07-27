import { validateBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-812: 請求明細に金額が0円の行を含むとき、該当データを不承認と判定する', () => {
    const billing_details = [
      {
        line_number: 1,
        product_code: 'PROD001',
        quantity: 1,
        unit_price: 10000,
        subtotal: 10000,
      },
      {
        line_number: 2,
        product_code: 'PROD002',
        quantity: 0,
        unit_price: 5000,
        subtotal: 0,
      },
      {
        line_number: 3,
        product_code: 'PROD003',
        quantity: 2,
        unit_price: 3000,
        subtotal: 6000,
      },
    ];

    const billing_target_data = {
      billing_id: 'BILL-20240115-001',
      customer_id: 'CUST-001',
      customer_name: '田中商事',
      total_amount: 16000,
      billing_date: '2024-01-15',
      billing_details: billing_details,
    };

    const validation_result = validateBillingTargetData(billing_target_data);

    expect(validation_result.is_valid).toBe(false);
    expect(validation_result.validation_status).toBe('REJECTED');
    expect(validation_result.error_messages).toContainEqual(
      expect.objectContaining({
        line_number: 2,
        reason_code: 'ZERO_AMOUNT_LINE',
      })
    );
    expect(
      validation_result.error_messages.some(
        (msg) => msg.reason_code === 'ZERO_AMOUNT_LINE' && msg.line_number === 2
      )
    ).toBe(true);
    expect(validation_result.can_proceed_to_next_stage).toBe(false);
  });
});