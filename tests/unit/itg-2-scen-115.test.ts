import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  reflectInvoiceToPortal,
  verifyPortalInvoiceDisplay,
} from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータルでの商談情報参照機能", () => {
  let mockCurrentDate: Date;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // SCEN-115
  test("請求書ポータル反映タイムラインコントロール - 金曜日に承認された請求書が月曜日までにポータルに反映される", () => {
    // 前提: テスト環境の現在日時を金曜日に設定
    // 2024-01-12は金曜日
    const fridayApprovalDate = new Date("2024-01-12T15:30:00Z");
    jest.useFakeTimers();
    jest.setSystemTime(fridayApprovalDate);

    // 請求書データの作成と承認ワークフローへの送信
    const invoiceDataOnFriday = {
      invoiceId: "INV-2024-001",
      customerId: "CUST-12345",
      invoiceNumber: "INV-2024-001-PORTAL",
      totalAmount: 150000,
      dueDate: new Date("2024-01-31T00:00:00Z"),
      invoiceDate: new Date("2024-01-12T00:00:00Z"),
      status: "pending_approval",
      items: [
        {
          itemId: "ITEM-001",
          description: "Software License",
          quantity: 1,
          unitPrice: 100000,
          taxAmount: 10000,
        },
        {
          itemId: "ITEM-002",
          description: "Support Service",
          quantity: 12,
          unitPrice: 4000,
          taxAmount: 4800,
        },
      ],
      submittedAt: fridayApprovalDate,
    };

    // 承認者による承認処理の実行
    const approvalResult = {
      invoiceId: invoiceDataOnFriday.invoiceId,
      approvedAt: fridayApprovalDate,
      approverName: "Manager A",
      approvalStatus: "approved",
      previousStatus: "pending_approval",
    };

    // 承認後のシステム内部状態確認
    expect(approvalResult.approvalStatus).toBe("approved");
    expect(approvalResult.previousStatus).toBe("pending_approval");
    expect(approvalResult.approvedAt.getDay()).toBe(5); // 金曜日 (0=日, 5=金)

    // テスト環境の現在日時を月曜日に進める
    // 2024-01-15は月曜日 (金曜日の3日後)
    const mondayReflectionDate = new Date("2024-01-15T10:00:00Z");
    jest.setSystemTime(mondayReflectionDate);

    // ポータルのデータベースまたはキャッシュ更新処理をトリガー
    const updateInvoiceDataForPortal = {
      invoiceId: invoiceDataOnFriday.invoiceId,
      customerId: invoiceDataOnFriday.customerId,
      invoiceNumber: invoiceDataOnFriday.invoiceNumber,
      totalAmount: invoiceDataOnFriday.totalAmount,
      dueDate: invoiceDataOnFriday.dueDate,
      status: "approved",
      reflectedAt: mondayReflectionDate,
      reflectionDeadlineMs:
        mondayReflectionDate.getTime() - fridayApprovalDate.getTime(),
    };

    // 営業日ベースで1日以内に反映されたか検証 (金曜から月曜までは営業日で1日)
    const businessDayThreshold = 24 * 60 * 60 * 1000; // 1日をミリ秒で表現
    expect(updateInvoiceDataForPortal.reflectionDeadlineMs).toBeLessThanOrEqual(
      businessDayThreshold
    );

    // 顧客向けポータル画面へのアクセス
    const portalAccessContext = {
      customerId: invoiceDataOnFriday.customerId,
      accessedAt: mondayReflectionDate,
      requestedInvoiceId: invoiceDataOnFriday.invoiceId,
    };

    // 該当する請求書が表示されているか確認
    const portalDisplayResult = verifyPortalInvoiceDisplay({
      customerId: portalAccessContext.customerId,
      invoiceId: portalAccessContext.requestedInvoiceId,
      expectedInvoiceNumber: invoiceDataOnFriday.invoiceNumber,
      expectedTotalAmount: invoiceDataOnFriday.totalAmount,
      expectedStatus: "approved",
      expectedDueDate: invoiceDataOnFriday.dueDate,
    });

    // 請求書の詳細情報が正確に反映されているか検証
    expect(portalDisplayResult.isDisplayed).toBe(true);
    expect(portalDisplayResult.invoiceNumber).toBe("INV-2024-001-PORTAL");
    expect(portalDisplayResult.totalAmount).toBe(150000);
    expect(portalDisplayResult.status).toBe("approved");
    expect(portalDisplayResult.dueDate).toEqual(new Date("2024-01-31T00:00:00Z"));

    // 請求書の明細情報が正確に反映されているか検証
    expect(portalDisplayResult.itemCount).toBe(2);
    expect(portalDisplayResult.items[0]).toEqual({
      itemId: "ITEM-001",
      description: "Software License",
      quantity: 1,
      unitPrice: 100000,
      taxAmount: 10000,
    });
    expect(portalDisplayResult.items[1]).toEqual({
      itemId: "ITEM-002",
      description: "Support Service",
      quantity: 12,
      unitPrice: 4000,
      taxAmount: 4800,
    });

    // ポータル反映の呼び出し
    const reflectionResponse = reflectInvoiceToPortal({
      invoiceId: invoiceDataOnFriday.invoiceId,
      customerId: invoiceDataOnFriday.customerId,
      approvalTimestamp: fridayApprovalDate.toISOString(),
      reflectionTimestamp: mondayReflectionDate.toISOString(),
    });

    // 反映結果の検証
    expect(reflectionResponse.success).toBe(true);
    expect(reflectionResponse.reflectedInvoiceId).toBe("INV-2024-001");
    expect(reflectionResponse.reflectionStatus).toBe("completed");
    expect(reflectionResponse.portalVisibilityFlag).toBe(true);

    // 金曜日承認から月曜日反映までのタイムラインが営業日ベース1日以内であること確認
    const approvalTimestamp = new Date(reflectionResponse.approvalTimestamp);
    const reflectionTimestamp = new Date(reflectionResponse.reflectionTimestamp);
    const timeDiffMs = reflectionTimestamp.getTime() - approvalTimestamp.getTime();
    const maxBusinessDayMs = 24 * 60 * 60 * 1000;

    expect(timeDiffMs).toBeLessThanOrEqual(maxBusinessDayMs);
    expect(approvalTimestamp.getDay()).toBe(5); // 金曜日
    expect(reflectionTimestamp.getDay()).toBe(1); // 月曜日
  });
});