import { validateInvoiceFormat } from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  test("SCEN-262: 請求書フォーマットが不正な場合に配信前にバリデーションエラーを返す", () => {
    // 前提：営業管理システムにログイン済み
    // 発生条件：請求書テンプレートに不正なフォーマット（金額フィールドに文字列を入力）で配信を実行しようとした時点

    // 不正なフォーマット：金額フィールドに文字列を入力
    const invalidInvoiceTemplate = {
      invoiceNumber: "INV-2024-001",
      customerId: "CUST-12345",
      customerName: "テスト顧客株式会社",
      issueDate: "2024-01-15",
      amount: "invalid_amount_string", // 本来は数値のはず
      taxAmount: 8000,
      totalAmount: 108000,
      dueDate: "2024-02-15",
      items: [
        {
          itemName: "商品A",
          quantity: 10,
          unitPrice: 10000,
          lineTotal: 100000,
        },
      ],
    };

    // 期待結果：バリデーションエラーが throw される
    // エラーメッセージは「金額」に関連するキーワードを含む
    expect(() => validateInvoiceFormat(invalidInvoiceTemplate)).toThrow(/金額/);
  });
});