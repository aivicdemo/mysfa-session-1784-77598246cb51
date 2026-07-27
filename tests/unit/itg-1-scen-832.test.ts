import { validateInvoiceLineItems } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け - 請求対象データ妥当性検証", () => {
  // SCEN-832: [error] 請求対象データ妥当性検証機能 - 請求明細に単価が欠けている行を含むとき、該当データを不承認と判定する
  test("請求明細に単価が欠けている行を含むとき、該当データを不承認と判定する", () => {
    // Arrange: 複数行の請求明細を準備。そのうち1行以上で単価(unitPrice)が欠落
    const invoiceId = "INV-20240115-001";
    const customerId = "CUST-001";
    const invoiceLineItems = [
      {
        lineItemId: "LINE-001",
        productName: "商品A",
        quantity: 10,
        unitPrice: 1000,
      },
      {
        lineItemId: "LINE-002",
        productName: "商品B",
        quantity: 5,
        unitPrice: null, // 単価が null の行
      },
      {
        lineItemId: "LINE-003",
        productName: "商品C",
        quantity: 3,
        unitPrice: undefined, // 単価が undefined の行
      },
    ];

    const invoiceData = {
      invoiceId: invoiceId,
      customerId: customerId,
      invoiceDate: "2024-01-15T11:00:00Z",
      dueDate: "2024-02-15T11:00:00Z",
      totalAmount: 15000,
      lineItems: invoiceLineItems,
      status: "pending_approval",
    };

    // Act: 検証メソッドを呼び出す
    const validationResult = validateInvoiceLineItems(invoiceData);

    // Assert: 検証結果が不承認であることを確認
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.status).toBe("validation_failed");

    // エラーコード・メッセージが単価欠落を示す内容であることを確認
    expect(validationResult.errorMessage).toMatch(/単価|unitPrice/i);
    expect(validationResult.errors).toBeDefined();
    expect(validationResult.errors.length).toBeGreaterThan(0);

    // エラー詳細に単価が欠けている具体的な行番号または請求明細IDが含まれていることを確認
    const errorDetails = validationResult.errors;
    expect(errorDetails).toContainEqual(
      expect.objectContaining({
        lineItemId: "LINE-002",
        errorMessage: expect.stringMatching(/単価|unitPrice/i),
      })
    );
    expect(errorDetails).toContainEqual(
      expect.objectContaining({
        lineItemId: "LINE-003",
        errorMessage: expect.stringMatching(/単価|unitPrice/i),
      })
    );

    // 請求データ全体のステータスが『検証失敗（validation_failed）』に更新されていることを確認
    expect(validationResult.invoiceStatus).toBe("validation_failed");

    // 検証失敗により、以降の請求処理へ進まないことを確認
    expect(validationResult.canProceedToProcessing).toBe(false);
  });
});