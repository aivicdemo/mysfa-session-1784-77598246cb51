import { generatePaymentLinkWithFallback } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-171
  test('GMO Payment Gateway連携 - generatePaymentLinkが失敗した場合、利用者に「支払いリンクの生成に失敗しました。銀行振込でお支払いください」メッセージが表示される', async () => {
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockRejectedValue(
        new Error('Payment gateway service unavailable')
      ),
    };

    const invoiceId = 'INV-20240115-001';
    const invoiceAmount = 150000;
    const bankTransferInfo = {
      bankName: '営業銀行',
      branchName: '東京支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: '株式会社テスト',
    };

    const result = await generatePaymentLinkWithFallback(
      {
        invoiceId,
        amount: invoiceAmount,
        customerId: 'CUST-20240115-001',
      },
      mockPaymentGatewayAdapter
    );

    expect(result).toEqual({
      success: false,
      errorMessage: '支払いリンクの生成に失敗しました。銀行振込でお支払いください',
      fallbackMode: true,
      bankTransferInfo: bankTransferInfo,
      paymentLink: null,
    });
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId,
        amount: invoiceAmount,
      })
    );
  });
});