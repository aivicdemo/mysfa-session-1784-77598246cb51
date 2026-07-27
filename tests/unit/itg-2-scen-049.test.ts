import { validateInvoiceCustomerInfo } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 請求書検証・承認機能", () => {
  // SCEN-049: [error] 請求書検証・承認機能 - 請求書の顧客情報が不正な場合、検証エラーが発生し差戻し指示が実行される
  test("顧客情報が不正な請求書に対して検証エラーが発生し、差戻し処理が実行される", () => {
    // 顧客IDが未入力のケース
    const invoiceWithMissingCustomerId = {
      invoiceId: "INV-20240115-001",
      customerId: "",
      customerName: "株式会社テスト",
      customerEmail: "test@example.com",
      invoiceAmount: 100000,
      invoiceDate: "2024-01-15",
      status: "pending_approval",
    };

    expect(() =>
      validateInvoiceCustomerInfo(invoiceWithMissingCustomerId)
    ).toThrow(/顧客ID/);

    // 顧客名が空白のケース
    const invoiceWithBlankCustomerName = {
      invoiceId: "INV-20240115-002",
      customerId: "CUST-12345",
      customerName: "   ",
      customerEmail: "test@example.com",
      invoiceAmount: 100000,
      invoiceDate: "2024-01-15",
      status: "pending_approval",
    };

    expect(() =>
      validateInvoiceCustomerInfo(invoiceWithBlankCustomerName)
    ).toThrow(/顧客名/);

    // メールアドレス形式が不正のケース
    const invoiceWithInvalidEmail = {
      invoiceId: "INV-20240115-003",
      customerId: "CUST-12345",
      customerName: "株式会社テスト",
      customerEmail: "invalid-email-format",
      invoiceAmount: 100000,
      invoiceDate: "2024-01-15",
      status: "pending_approval",
    };

    expect(() =>
      validateInvoiceCustomerInfo(invoiceWithInvalidEmail)
    ).toThrow(/メールアドレス/);

    // 顧客情報が正常な場合の検証成功
    const validInvoice = {
      invoiceId: "INV-20240115-004",
      customerId: "CUST-12345",
      customerName: "株式会社テスト",
      customerEmail: "test@example.com",
      invoiceAmount: 100000,
      invoiceDate: "2024-01-15",
      status: "pending_approval",
    };

    const validationResult = validateInvoiceCustomerInfo(validInvoice);

    expect(validationResult).toEqual({
      invoiceId: "INV-20240115-004",
      customerId: "CUST-12345",
      customerName: "株式会社テスト",
      customerEmail: "test@example.com",
      invoiceAmount: 100000,
      invoiceDate: "2024-01-15",
      status: "pending_approval",
      validationStatus: "valid",
      validatedAt: expect.any(String),
    });
  });
});