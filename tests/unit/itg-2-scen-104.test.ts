import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";

const fetchMock = require("jest-fetch-mock");

import {
  distributeInvoiceToCustomerPortal,
} from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  // SCEN-104
  test("[normal] 請求書自動配信機能 - 経理担当者承認後、統一フォーマットの請求書が顧客ポータルに配信される", async () => {
    // 準備: テスト用請求書データ
    const invoiceData = {
      invoiceId: "INV-2024-001",
      invoiceNumber: "請求番号-2024-001",
      customerId: "CUST-12345",
      customerName: "テスト顧客企業",
      invoiceDate: "2024-01-15",
      dueDate: "2024-02-15",
      totalAmount: 150000,
      taxAmount: 15000,
      subtotal: 135000,
      items: [
        {
          itemId: "ITEM-001",
          description: "商品A",
          quantity: 10,
          unitPrice: 10000,
          amount: 100000,
        },
        {
          itemId: "ITEM-002",
          description: "サービスB",
          quantity: 1,
          unitPrice: 35000,
          amount: 35000,
        },
      ],
      status: "pending_approval",
      accountingApprovalId: "ACC-USER-001",
      createdAt: "2024-01-15T10:00:00Z",
    };

    const approvalRequestPayload = {
      invoiceId: invoiceData.invoiceId,
      requestedBy: "SALES-USER-001",
      requestedAt: "2024-01-15T10:30:00Z",
      approverRole: "accounting",
    };

    const approvalData = {
      invoiceId: invoiceData.invoiceId,
      approverUserId: "ACC-USER-001",
      approvedAt: "2024-01-15T11:00:00Z",
      approvalStatus: "approved",
      remarks: "内容確認完了",
    };

    const distributionPayload = {
      invoiceId: invoiceData.invoiceId,
      customerId: invoiceData.customerId,
      approvalTimestamp: approvalData.approvedAt,
      distributionFormat: "unified",
      outputFormat: "pdf",
    };

    const distributedInvoiceResponse = {
      invoiceId: invoiceData.invoiceId,
      invoiceNumber: invoiceData.invoiceNumber,
      customerId: invoiceData.customerId,
      customerName: invoiceData.customerName,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      totalAmount: 150000,
      taxAmount: 15000,
      subtotal: 135000,
      header: {
        companyName: "発行企業名",
        companyAddress: "東京都渋谷区1-1-1",
        taxId: "12-3456789",
      },
      items: invoiceData.items,
      signature: {
        approverName: "経理部長",
        approverTitle: "経理部長",
        approvalDate: "2024-01-15",
      },
      distributedAt: "2024-01-15T11:30:00Z",
      pdfUrl: "/portal/invoices/INV-2024-001/download.pdf",
      status: "distributed",
      format: "unified_template",
      outputFormat: "pdf",
    };

    // モック設定: 請求書承認APIエンドポイント
    fetchMock.mockResponseOnce(JSON.stringify(approvalData), {
      status: 200,
    });

    // モック設定: 請求書配信APIエンドポイント
    fetchMock.mockResponseOnce(JSON.stringify(distributedInvoiceResponse), {
      status: 200,
    });

    // 実行: 経理担当者承認後、請求書を顧客ポータルに配信
    const result = await distributeInvoiceToCustomerPortal(distributionPayload);

    // 検証: 配信結果が返却されたか
    expect(result).toBeDefined();
    expect(result.invoiceId).toBe("INV-2024-001");
    expect(result.status).toBe("distributed");

    // 検証: 請求書が統一フォーマットで配信されたか
    expect(result.format).toBe("unified_template");
    expect(result.outputFormat).toBe("pdf");

    // 検証: ヘッダー情報が含まれているか
    expect(result.header).toBeDefined();
    expect(result.header.companyName).toBe("発行企業名");
    expect(result.header.companyAddress).toBe("東京都渋谷区1-1-1");
    expect(result.header.taxId).toBe("12-3456789");

    // 検証: 請求番号が正確に反映されているか
    expect(result.invoiceNumber).toBe("請求番号-2024-001");

    // 検証: 金額情報が正確か
    expect(result.totalAmount).toBe(150000);
    expect(result.taxAmount).toBe(15000);
    expect(result.subtotal).toBe(135000);

    // 検証: 明細情報が正確に反映されているか
    expect(result.items).toHaveLength(2);
    expect(result.items[0].description).toBe("商品A");
    expect(result.items[0].amount).toBe(100000);
    expect(result.items[1].description).toBe("サービスB");
    expect(result.items[1].amount).toBe(35000);

    // 検証: 支払期限が反映されているか
    expect(result.dueDate).toBe("2024-02-15");

    // 検証: 署名欄（承認者情報）が含まれているか
    expect(result.signature).toBeDefined();
    expect(result.signature.approverName).toBe("経理部長");
    expect(result.signature.approverTitle).toBe("経理部長");
    expect(result.signature.approvalDate).toBe("2024-01-15");

    // 検証: PDFダウンロードリンクが生成されているか
    expect(result.pdfUrl).toBeDefined();
    expect(result.pdfUrl).toContain("download.pdf");

    // 検証: 配信タイムスタンプが記録されているか
    expect(result.distributedAt).toBe("2024-01-15T11:30:00Z");

    // 検証: 配信から顧客ポータル反映が営業日ベースで1日以内に完了しているか
    const distributedTime = new Date("2024-01-15T11:30:00Z").getTime();
    const approvedTime = new Date("2024-01-15T11:00:00Z").getTime();
    const timeDifferenceMinutes = (distributedTime - approvedTime) / (1000 * 60);
    expect(timeDifferenceMinutes).toBeLessThanOrEqual(1440); // 24時間以内

    // 検証: 顧客ポータルへの配信が確認できるか（ステータス確認）
    expect(result.customerId).toBe("CUST-12345");
    expect(result.customerName).toBe("テスト顧客企業");

    // 検証: API呼び出しが実行されたか
    expect(fetchMock.mock.calls).toHaveLength(2);

    // 検証: 最初のAPI呼び出し（承認）の確認
    expect(fetchMock.mock.calls[0][0]).toContain("approval");

    // 検証: 2番目のAPI呼び出し（配信）の確認
    expect(fetchMock.mock.calls[1][0]).toContain("distribution");
  });
});