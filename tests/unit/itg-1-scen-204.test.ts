import { reconcileDealStatusWithInvoice } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-204
  test("商談ステータスと請求書発行日・金額が正常に照合され、ズレが検出される", () => {
    // 正常系: 商談ステータス（受注100万円）と請求書（100万円）が一致
    const normalDeal = {
      dealId: "DEAL-001",
      status: "受注",
      amount: 1000000,
      plannedInvoiceDate: new Date("2024-01-31T00:00:00Z"),
    };

    const normalInvoice = {
      invoiceId: "INV-001",
      amount: 1000000,
      issuedDate: new Date("2024-01-31T00:00:00Z"),
    };

    const normalResult = reconcileDealStatusWithInvoice({
      deal: normalDeal,
      invoice: normalInvoice,
    });

    expect(normalResult.isMatched).toBe(true);
    expect(normalResult.discrepancy).toBeNull();
    expect(normalResult.alertNotificationSent).toBe(false);
    expect(normalResult.logRecorded).toBe(true);

    // 異常系: 商談ステータス（受注100万円）と請求書（90万円）でズレが発生
    const mismatchedInvoice = {
      invoiceId: "INV-002",
      amount: 900000,
      issuedDate: new Date("2024-01-31T00:00:00Z"),
    };

    const mismatchResult = reconcileDealStatusWithInvoice({
      deal: normalDeal,
      invoice: mismatchedInvoice,
    });

    expect(mismatchResult.isMatched).toBe(false);
    expect(mismatchResult.discrepancy).not.toBeNull();
    expect(mismatchResult.discrepancy?.amountDifference).toBe(100000);
    expect(mismatchResult.discrepancy?.expectedAmount).toBe(1000000);
    expect(mismatchResult.discrepancy?.actualAmount).toBe(900000);
    expect(mismatchResult.discrepancy?.location).toBe("金額");
    expect(mismatchResult.alertNotificationSent).toBe(true);
    expect(mismatchResult.alertRecipient).toBe("admin");
    expect(mismatchResult.logRecorded).toBe(true);

    // 日付ズレテスト: 商談計画日（2024-01-31）と請求日（2024-02-15）でズレが発生
    const dateMismatchedInvoice = {
      invoiceId: "INV-003",
      amount: 1000000,
      issuedDate: new Date("2024-02-15T00:00:00Z"),
    };

    const dateMismatchResult = reconcileDealStatusWithInvoice({
      deal: normalDeal,
      invoice: dateMismatchedInvoice,
    });

    expect(dateMismatchResult.isMatched).toBe(false);
    expect(dateMismatchResult.discrepancy).not.toBeNull();
    expect(dateMismatchResult.discrepancy?.location).toBe("請求日");
    expect(dateMismatchResult.discrepancy?.expectedDate).toEqual(
      new Date("2024-01-31T00:00:00Z")
    );
    expect(dateMismatchResult.discrepancy?.actualDate).toEqual(
      new Date("2024-02-15T00:00:00Z")
    );
    expect(dateMismatchResult.alertNotificationSent).toBe(true);
    expect(dateMismatchResult.logRecorded).toBe(true);

    // 未請求案件テスト: 商談ステータス「受注」だが請求書がnull
    const unissuedInvoiceResult = reconcileDealStatusWithInvoice({
      deal: normalDeal,
      invoice: null,
    });

    expect(unissuedInvoiceResult.isMatched).toBe(false);
    expect(unissuedInvoiceResult.discrepancy).not.toBeNull();
    expect(unissuedInvoiceResult.discrepancy?.type).toBe("未請求案件");
    expect(unissuedInvoiceResult.alertNotificationSent).toBe(true);
    expect(unissuedInvoiceResult.logRecorded).toBe(true);

    // ログ内容の検証
    expect(normalResult.logEntry).toMatchObject({
      timestamp: expect.any(Date),
      dealId: "DEAL-001",
      reconciliationStatus: "matched",
      detailedMessage: expect.stringContaining("照合成功"),
    });

    expect(mismatchResult.logEntry).toMatchObject({
      timestamp: expect.any(Date),
      dealId: "DEAL-001",
      reconciliationStatus: "discrepancy_detected",
      detailedMessage: expect.stringContaining("金額差分"),
    });

    // エラーケース: 商談ステータスが「失注」の場合は照合をスキップ
    const lostDeal = {
      dealId: "DEAL-002",
      status: "失注",
      amount: 500000,
      plannedInvoiceDate: new Date("2024-01-31T00:00:00Z"),
    };

    const lostDealResult = reconcileDealStatusWithInvoice({
      deal: lostDeal,
      invoice: null,
    });

    expect(lostDealResult.isMatched).toBe(true);
    expect(lostDealResult.discrepancy).toBeNull();
    expect(lostDealResult.alertNotificationSent).toBe(false);
    expect(lostDealResult.logEntry.reconciliationStatus).toBe("skipped");
  });
});