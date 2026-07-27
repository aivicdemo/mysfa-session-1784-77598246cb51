import {
  getTransactionStatus,
  PaymentGatewayAdapter,
} from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け - GMO Payment Gateway連携", () => {
  // SCEN-1011
  test("getTransactionStatusが成功応答を受けた場合、決済トランザクションの詳細ステータスが取得される", async () => {
    const transactionId = "txn_20240115_001";
    const invoiceId = "inv_20240115_A001";
    const customerId = "cust_12345";
    const customerName = "テスト顧客株式会社";
    const customerEmail = "contact@test-customer.jp";
    const paymentAmount = 150000;
    const paymentDateTime = "2024-01-15T14:30:00Z";
    const paymentMethod = "credit_card";
    const transactionStatus = "completed";

    const assumedResponse = {
      transactionId: transactionId,
      invoiceId: invoiceId,
      status: transactionStatus,
      amount: paymentAmount,
      paidAt: paymentDateTime,
      paymentMethod: paymentMethod,
      customer: {
        id: customerId,
        name: customerName,
        email: customerEmail,
      },
    };

    const mockPaymentGatewayAdapter: PaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn().mockResolvedValue(assumedResponse),
    };

    const result = await getTransactionStatus(
      mockPaymentGatewayAdapter,
      transactionId
    );

    expect(result).toEqual({
      transactionId: transactionId,
      invoiceId: invoiceId,
      status: transactionStatus,
      amount: paymentAmount,
      paidAt: paymentDateTime,
      paymentMethod: paymentMethod,
      customer: {
        id: customerId,
        name: customerName,
        email: customerEmail,
      },
    });

    expect(mockPaymentGatewayAdapter.getTransactionStatus).toHaveBeenCalledWith(
      transactionId
    );
    expect(mockPaymentGatewayAdapter.getTransactionStatus).toHaveBeenCalledTimes(
      1
    );
  });
});