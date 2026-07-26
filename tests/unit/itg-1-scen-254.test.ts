import { validateCustomerInvoiceDetails } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-254
  test('顧客請求内容検証機能 - 請求明細の商品数が期待値と異なる場合に異常フラグが立てられ営業に通知される', () => {
    const input = {
      customerId: 'TEST-001',
      invoiceDetails: [
        { productId: 'P001', quantity: 1, amount: 10000 },
        { productId: 'P002', quantity: 1, amount: 20000 },
        { productId: 'P003', quantity: 1, amount: 15000 },
      ],
      expectedProductCount: 5,
    };

    const result = validateCustomerInvoiceDetails(input);

    expect(result.isValid).toBe(false);
    expect(result.anomalyFlagSet).toBe(true);
    expect(result.actualProductCount).toBe(3);
    expect(result.expectedProductCount).toBe(5);
    expect(result.notificationRequired).toBe(true);
    expect(result.notificationMessage).toBe(
      '顧客TEST-001の請求明細の商品数が不一致です。期待値：5件、実際：3件'
    );
    expect(result.differenceInfo).toEqual({
      expected: 5,
      actual: 3,
      difference: -2,
    });
  });
});