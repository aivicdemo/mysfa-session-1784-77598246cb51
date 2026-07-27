import { generateInvoiceWithPaymentFallback } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-1012
  test("GMO Payment Gateway連携 - generatePaymentLinkが失敗した場合、ユーザーに「支払いリンク生成に失敗しました」と表示され、代替動作として銀行振込先情報のみが表示される", () => {
    const invoiceId = "INV-20240115-001";
    const amountJpy = 100000;
    const customerEmail = "customer@example.com";
    const maxRetries = 3;

    const stubPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockRejectedValue(
        new Error("Payment gateway temporarily unavailable")
      ),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const invoiceData = {
      invoiceId: invoiceId,
      amount: amountJpy,
      customerEmail: customerEmail,
      bankTransferInfo: {
        bankName: "○○銀行",
        branchName: "××支店",
        accountType: "普通",
        accountNumber: "1234567",
        accountHolderName: "営業管理システム",
      },
    };

    const result = generateInvoiceWithPaymentFallback(
      invoiceData,
      stubPaymentGatewayAdapter
    );

    expect(result.userMessage).toBe(
      "支払いリンク生成に失敗しました。銀行振込でお支払いください"
    );
    expect(result.paymentMethod).toBe("bank_transfer_only");
    expect(result.displayBankTransferInfo).toEqual({
      bankName: "○○銀行",
      branchName: "××支店",
      accountType: "普通",
      accountNumber: "1234567",
      accountHolderName: "営業管理システム",
    });
    expect(result.onlinePaymentLink).toBeNull();
    expect(result.invoiceStatus).toBe("unpaid");
    expect(result.decisionLog).toMatch(/generatePaymentLink failure/);
    expect(result.decisionLog).toMatch(/retry count: 3\/3/);
    expect(stubPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(
      maxRetries
    );
  });
});