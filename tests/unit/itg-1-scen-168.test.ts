import { describe, test, expect } from "@jest/globals";
import {
  generateEstimate,
  generateOrder,
  generateInvoice,
} from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  test("SCEN-168: 商談金額が0円の場合、見積・注文・請求書が正常に生成される", () => {
    // Arrange: 商談金額が0円の商談レコード
    const dealRecord = {
      dealId: "DEAL-001",
      dealName: "テスト案件",
      customerId: "CUST-001",
      customerName: "テスト顧客",
      dealAmount: 0,
      dealStatus: "成約",
      dealDetails: [
        {
          lineId: "LINE-001",
          productName: "テスト商品",
          quantity: 1,
          unitPrice: 0,
          lineAmount: 0,
        },
      ],
      dealDate: "2024-01-15",
    };

    // Act: 見積書を自動生成
    const estimateResult = generateEstimate(dealRecord);

    // Assert: 見積書の正常生成を検証
    expect(estimateResult).toBeDefined();
    expect(estimateResult.estimateId).toBeDefined();
    expect(estimateResult.totalAmount).toBe(0);
    expect(estimateResult.status).toBe("有効");
    expect(estimateResult.customerName).toBe("テスト顧客");
    expect(estimateResult.details).toHaveLength(1);
    expect(estimateResult.details[0].lineAmount).toBe(0);
    expect(estimateResult.errorMessage).toBeUndefined();

    // Act: 注文書を自動生成
    const orderResult = generateOrder(dealRecord);

    // Assert: 注文書の正常生成を検証
    expect(orderResult).toBeDefined();
    expect(orderResult.orderId).toBeDefined();
    expect(orderResult.totalAmount).toBe(0);
    expect(orderResult.status).toBe("有効");
    expect(orderResult.customerName).toBe("テスト顧客");
    expect(orderResult.details).toHaveLength(1);
    expect(orderResult.details[0].lineAmount).toBe(0);
    expect(orderResult.errorMessage).toBeUndefined();

    // Act: 請求書を自動生成
    const invoiceResult = generateInvoice(dealRecord);

    // Assert: 請求書の正常生成を検証
    expect(invoiceResult).toBeDefined();
    expect(invoiceResult.invoiceId).toBeDefined();
    expect(invoiceResult.totalAmount).toBe(0);
    expect(invoiceResult.status).toBe("有効");
    expect(invoiceResult.customerName).toBe("テスト顧客");
    expect(invoiceResult.details).toHaveLength(1);
    expect(invoiceResult.details[0].lineAmount).toBe(0);
    expect(invoiceResult.errorMessage).toBeUndefined();

    // Assert: 各書類の金額欄が0円として正しく反映されることを検証
    expect(estimateResult.totalAmount).toBe(0);
    expect(orderResult.totalAmount).toBe(0);
    expect(invoiceResult.totalAmount).toBe(0);

    // Assert: 各書類のステータスが有効であることを確認
    expect(estimateResult.status).toBe("有効");
    expect(orderResult.status).toBe("有効");
    expect(invoiceResult.status).toBe("有効");

    // Assert: エラーメッセージが表示されていないことを確認
    expect(estimateResult.errorMessage).toBeUndefined();
    expect(orderResult.errorMessage).toBeUndefined();
    expect(invoiceResult.errorMessage).toBeUndefined();
  });
});