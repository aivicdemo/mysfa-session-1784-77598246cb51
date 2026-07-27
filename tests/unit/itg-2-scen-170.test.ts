import { getTransactionStatus } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  test('SCEN-170: GMO Payment Gateway連携 - getTransactionStatusが成功応答を返した場合、決済トランザクションの詳細ステータスが正確に取得される', async () => {
    // Arrange: PaymentGatewayAdapterスタブを設定
    const assumedTransactionId = 'txn_20240115_001';
    const assumedPaymentStatus = 'completed';
    const assumedAmount = 150000;
    const assumedCurrency = 'JPY';
    const assumedPaymentMethod = 'credit_card';
    const assumedTransactionDateTime = '2024-01-15T11:30:45Z';
    const assumedCustomerId = 'cust_12345';
    const assumedCustomerName = 'Test Company Inc.';
    const assumedCustomerEmail = 'contact@testcompany.jp';

    const mockPaymentGatewayAdapter = {
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: assumedTransactionId,
        status: assumedPaymentStatus,
        amount: assumedAmount,
        currency: assumedCurrency,
        paymentMethod: assumedPaymentMethod,
        transactionDateTime: assumedTransactionDateTime,
        customer: {
          id: assumedCustomerId,
          name: assumedCustomerName,
          email: assumedCustomerEmail,
        },
      }),
    };

    // Act: 決済トランザクション詳細取得処理を実行
    const result = await getTransactionStatus(
      mockPaymentGatewayAdapter,
      assumedTransactionId
    );

    // Assert: 返却されたトランザクション詳細情報を検証
    expect(result).toEqual({
      transactionId: assumedTransactionId,
      status: assumedPaymentStatus,
      amount: assumedAmount,
      currency: assumedCurrency,
      paymentMethod: assumedPaymentMethod,
      transactionDateTime: assumedTransactionDateTime,
      customer: {
        id: assumedCustomerId,
        name: assumedCustomerName,
        email: assumedCustomerEmail,
      },
    });

    // 決済トランザクションID指定で呼び出されたことを確認
    expect(mockPaymentGatewayAdapter.getTransactionStatus).toHaveBeenCalledWith(
      assumedTransactionId
    );
    expect(mockPaymentGatewayAdapter.getTransactionStatus).toHaveBeenCalledTimes(1);
  });
});