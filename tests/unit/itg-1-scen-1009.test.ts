import { generatePaymentLink } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  test("SCEN-1009: GMO Payment Gateway連携 - generatePaymentLinkが成功応答を受けた場合、請求書に対応した支払いリンクが生成される", () => {
    // Arrange: テスト対象の請求書データを準備
    const invoiceId = "INV-20240115-001";
    const customerId = "CUST-12345";
    const customerName = "株式会社テスト";
    const customerEmail = "contact@test-company.co.jp";
    const invoiceAmount = 150000;
    const currency = "JPY";
    const invoiceDate = new Date("2024-01-15T00:00:00Z");
    const dueDate = new Date("2024-02-15T00:00:00Z");
    const paymentLinkExpiryDate = new Date("2024-02-14T23:59:59Z");

    const invoiceData = {
      invoiceId: invoiceId,
      customerId: customerId,
      customerName: customerName,
      customerEmail: customerEmail,
      amount: invoiceAmount,
      currency: currency,
      invoiceDate: invoiceDate,
      dueDate: dueDate,
      description: "サービス提供料金 2024年1月分",
    };

    // PaymentGatewayAdapterのスタブを作成
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        invoiceId: invoiceId,
        paymentLinkUrl:
          "https://payment.gmo-pg.com/v1/links/link_abc123def456ghi789jkl",
        linkExpiryDate: paymentLinkExpiryDate.toISOString(),
        transactionId: "tx_gmo_20240115_001",
        status: "active",
        amount: invoiceAmount,
        currency: currency,
      }),
    };

    // Act: generatePaymentLinkメソッドを呼び出し
    const resultPromise = generatePaymentLink(invoiceData, mockPaymentGatewayAdapter);

    // Assert: 戻り値を検証
    return resultPromise.then((result) => {
      // (1) PaymentGatewayAdapterから返された支払いリンクが請求書IDと対応していること
      expect(result.invoiceId).toBe(invoiceId);

      // (2) 支払いリンクのステータスが「active」として記録されていること
      expect(result.linkStatus).toBe("active");

      // (3) 支払いリンクURLが有効な形式で生成されていること
      expect(result.paymentLinkUrl).toMatch(
        /^https:\/\/payment\.gmo-pg\.com\/v1\/links\/link_[a-z0-9]+$/
      );

      // (4) 請求書のステータスが「支払い待機中」に更新されていること
      expect(result.invoiceStatus).toBe("支払い待機中");

      // (5) 支払いリンク有効期限がシステムに記録されていること
      expect(result.linkExpiryDate).toBe(paymentLinkExpiryDate.toISOString());

      // 追加検証: トランザクションIDが記録されていることを確認
      expect(result.transactionId).toBe("tx_gmo_20240115_001");

      // 追加検証: Adapterが正しい引数で呼び出されたことを確認
      expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
        invoiceData
      );
    });
  });
});