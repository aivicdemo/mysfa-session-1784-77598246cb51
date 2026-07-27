import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { issueQuote } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  let mockDocumentStorageAdapter: any;
  let mockNotificationServiceAdapter: any;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };
  });

  // SCEN-057
  test("帳票発行時の発行日時自動付与と発行履歴記録 - 営業担当者IDが欠けている入力で見積書を発行しようとしたときは例外が発生する", () => {
    const quoteInput = {
      customer_name: "テスト顧客株式会社",
      customer_id: "CUST-20240115-001",
      quote_items: [
        {
          product_name: "ソフトウェアライセンス",
          quantity: 10,
          unit_price: 50000,
        },
      ],
      total_amount: 500000,
      sales_person_id: "",
      quote_date: new Date("2024-01-15T11:00:00Z"),
    };

    expect(() =>
      issueQuote(
        quoteInput,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter
      )
    ).toThrow(/営業担当者ID/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendQuoteNotification
    ).not.toHaveBeenCalled();
  });
});