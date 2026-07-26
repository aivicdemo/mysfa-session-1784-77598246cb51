import {
  validateInvoiceDocument,
  approveInvoiceDocument,
} from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 請求書検証・承認機能", () => {
  // SCEN-099
  test("明細行が1行のみの請求書が検証・承認される", () => {
    const invoiceData = {
      invoiceId: "INV-20240115-001",
      invoiceDate: "2024-01-15",
      billingFrom: "販売会社太郎",
      billingTo: "顧客会社花子",
      totalAmount: 110000,
      taxAmount: 10000,
      subtotalAmount: 100000,
      lineItems: [
        {
          lineItemId: "LINE-001",
          productName: "ソフトウェアライセンス",
          quantity: 1,
          unitPrice: 100000,
          lineAmount: 100000,
        },
      ],
      lineItemCount: 1,
      status: "pending_review",
    };

    // 検証処理実行
    const validationResult = validateInvoiceDocument(invoiceData);

    // 検証結果の確認
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errorMessages).toEqual([]);
    expect(validationResult.warningMessages).toEqual([]);
    expect(validationResult.lineItemCount).toBe(1);
    expect(validationResult.totalAmountMatch).toBe(true);
    expect(validationResult.validationStatus).toBe("OK");

    // 承認処理実行
    const approvalInput = {
      invoiceId: "INV-20240115-001",
      approvalTimestamp: "2024-01-15T14:30:00Z",
      approverUserId: "USER-CUSTOMER-001",
      approvalComments: "内容確認済み、承認します",
    };

    const approvalResult = approveInvoiceDocument(approvalInput);

    // 承認結果の確認
    expect(approvalResult.approvalStatus).toBe("approved");
    expect(approvalResult.invoiceId).toBe("INV-20240115-001");
    expect(approvalResult.previousStatus).toBe("pending_review");
    expect(approvalResult.newStatus).toBe("approved");
    expect(approvalResult.approvalTimestamp).toBe("2024-01-15T14:30:00Z");
    expect(approvalResult.approverUserId).toBe("USER-CUSTOMER-001");
    expect(approvalResult.approvalMessage).toBe(
      "請求書 INV-20240115-001 が承認されました"
    );
    expect(typeof approvalResult.approvalId).toBe("string");
    expect(approvalResult.approvalId.length).toBeGreaterThan(0);
  });
});