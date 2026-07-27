import { generatePaymentLinkWithValidation } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-1015: [edge] GMO Payment Gateway連携 - generatePaymentLinkが予期しない応答形式を返した場合、不正な支払いリンクが業務結果として通されない
  test('generatePaymentLinkが予期しない応答形式を返した場合、銀行振込へのフォールバックが実行される', () => {
    // Arrange: PaymentGatewayAdapterのスタブを定義。generatePaymentLinkが不正な応答形式を返すように設定
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentUrl: 12345, // 期待値: 文字列のURLであるべき。数値で返すことで形式エラーを再現
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const invoiceId = 'INV-20240115-001';
    const amount = 50000;
    const currency = 'JPY';
    const customerEmail = 'customer@example.com';

    // Act: 支払いリンク生成処理を実行
    return generatePaymentLinkWithValidation(
      {
        invoiceId,
        amount,
        currency,
        customerEmail,
      },
      mockPaymentGatewayAdapter,
    ).then((result) => {
      // Assert: 不正な応答形式が検出され、フォールバック処理が実行されていることを確認
      expect(result.status).toBe('PAYMENT_METHOD_FALLBACK_TO_BANK_TRANSFER');
      expect(result.paymentUrl).toBeUndefined();
      expect(result.fallbackBankTransferInfo).toBeDefined();
      expect(result.errorMessage).toMatch(/generatePaymentLink returned invalid response format/);
      expect(result.userMessage).toBe('支払いリンクの生成に失敗しました。銀行振込でお支払いください');
    });
  });
});