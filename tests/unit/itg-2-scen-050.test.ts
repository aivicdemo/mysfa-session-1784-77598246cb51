import { validateInvoiceLineItems, rejectInvoice } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 請求書検証・承認機能", () => {
  // SCEN-050
  test("明細行が不正な場合、検証エラーが発生し差戻し指示が実行される", () => {
    // テストデータ: 不正な明細行を含む請求書
    const invoiceId = "INV-20240115-001";
    const invalidLineItems = [
      {
        lineItemId: "LINE-001",
        productId: "PROD-001",
        quantity: 0,
        unitPrice: 10000,
        amount: 0,
      },
      {
        lineItemId: "LINE-002",
        productId: "PROD-002",
        quantity: 2,
        unitPrice: -5000,
        amount: -10000,
      },
      {
        lineItemId: "LINE-003",
        productId: "PROD-003",
        quantity: "abc" as unknown as number,
        unitPrice: 3000,
        amount: 0,
      },
    ];

    // 期待値: 検証処理が数量0でエラーを検出
    expect(() =>
      validateInvoiceLineItems({
        invoiceId,
        lineItems: invalidLineItems,
      })
    ).toThrow(/数量/);

    // 期待値: 検証処理が負の単価でエラーを検出
    expect(() =>
      validateInvoiceLineItems({
        invoiceId,
        lineItems: invalidLineItems,
      })
    ).toThrow(/単価/);

    // 期待値: 検証処理が不正な数量型でエラーを検出
    expect(() =>
      validateInvoiceLineItems({
        invoiceId,
        lineItems: invalidLineItems,
      })
    ).toThrow(/型/);

    // テストデータ: 差戻し処理用の入力
    const rejectReason = "明細行に不正な値が含まれています";
    const rejectedBy = "USER-002";
    const rejectionTimestamp = new Date("2024-01-15T14:30:00Z");

    // 差戻し指示を実行
    const result = rejectInvoice({
      invoiceId,
      reason: rejectReason,
      rejectedBy,
      rejectionDate: rejectionTimestamp,
    });

    // 期待値: 差戻し処理が成功し、請求書ステータスが「差戻し」に更新される
    expect(result.invoiceId).toBe("INV-20240115-001");
    expect(result.status).toBe("差戻し");
    expect(result.reason).toBe("明細行に不正な値が含まれています");
    expect(result.rejectedBy).toBe("USER-002");
    expect(result.rejectionDate).toEqual(new Date("2024-01-15T14:30:00Z"));
    expect(result.recordedAt).toBeDefined();
  });
});