import { validateInvoiceLineItems } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-104
  test("[error] 請求書承認検証機能 - 請求書明細の数量が0のとき、検証エラーが発生する", () => {
    const invoice_id = "INV-20240115-001";
    const invoice_status = "保存待機中";
    const line_items = [
      {
        product_code: "PROD-001",
        product_name: "テスト商品",
        unit_price: 1000,
        quantity: 0,
      },
    ];

    const error_context = {
      invoice_id: invoice_id,
      invoice_status: invoice_status,
      line_items: line_items,
    };

    expect(() => {
      validateInvoiceLineItems(error_context);
    }).toThrow(/請求書明細の数量/);

    try {
      validateInvoiceLineItems(error_context);
    } catch (err: unknown) {
      const caught_error = err as {
        errorCode?: string;
        fieldName?: string;
        lineItemIndex?: number;
        rejectedValue?: number;
        message?: string;
      };
      expect(caught_error.errorCode).toBe("INVALID_LINE_ITEM_QUANTITY");
      expect(caught_error.fieldName).toBe("quantity");
      expect(caught_error.lineItemIndex).toBe(0);
      expect(caught_error.rejectedValue).toBe(0);
      expect(caught_error.message).toContain(
        "請求書明細の数量は1以上である必要があります"
      );
    }
  });
});