import { generateInvoiceWithPaymentLink } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-609
  test("請求書自動生成機能 - PaymentGatewayAdapterのgeneratePaymentLinkが成功した場合、生成リンクを請求書に埋め込む", () => {
    const invoiceId = "INV-2024-001";
    const customerId = "C001";
    const invoiceAmount = 100000;
    const expectedPaymentLink = "https://payment.example.com/pay?token=abc123";

    const invoiceData = {
      invoiceId,
      customerId,
      amount: invoiceAmount,
      customerName: "テスト顧客",
      issueDate: "2024-01-15",
      items: [
        {
          description: "サービス提供料",
          quantity: 1,
          unitPrice: invoiceAmount,
        },
      ],
    };

    const paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: expectedPaymentLink,
        status: "success",
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const result = generateInvoiceWithPaymentLink(
      invoiceData,
      paymentGatewayAdapterStub
    );

    expect(paymentGatewayAdapterStub.generatePaymentLink).toHaveBeenCalledWith(
      invoiceId,
      invoiceAmount
    );

    expect(result).toEqual(
      expect.objectContaining({
        invoiceId,
        customerId,
        amount: invoiceAmount,
        paymentLink: expectedPaymentLink,
      })
    );

    expect(result.paymentLink).toBe(expectedPaymentLink);
  });
});