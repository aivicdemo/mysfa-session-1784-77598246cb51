import { determineDealUnbilledFlag } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-065
  test("未請求案件フラグ付与機能 - 請求書発行予定日が本日より前の場合、請求遅延フラグが正しく付与される", () => {
    // 前提: 商談ステータスが「受注」に更新され、請求書発行予定日が設定されている状態
    // 発生条件: 月次営業成績集計処理で、商談レコードと請求書発行履歴を照合したとき
    // 結果: 未請求案件または請求遅延案件に自動フラグを付与し、経営層が即座に特定・対応できる

    // テストデータセットアップ
    const today = new Date("2024-01-15T00:00:00Z");
    const yesterdayBillingDate = new Date("2024-01-14T00:00:00Z");
    const tomorrow = new Date("2024-01-16T00:00:00Z");

    // ケース1: 請求書発行予定日が本日より前 → フラグ付与される (遅延)
    const dealDataWithPastDueDate = {
      dealId: "DEAL001",
      customerId: "CUST001",
      dealAmount: 500000,
      dealStatus: "受注",
      expectedBillingDate: yesterdayBillingDate,
      currentDate: today,
      isInvoiceIssued: false,
    };

    const resultPastDue = determineDealUnbilledFlag(dealDataWithPastDueDate);

    // 期待結果: 遅延フラグが true で付与される
    expect(resultPastDue).toEqual({
      dealId: "DEAL001",
      hasUnbilledFlag: true,
      delayStatus: "遅延",
      daysOverdue: 1,
    });

    // ケース2: 請求書発行予定日が本日より後 → フラグ未付与
    const dealDataWithFutureDueDate = {
      dealId: "DEAL002",
      customerId: "CUST002",
      dealAmount: 300000,
      dealStatus: "受注",
      expectedBillingDate: tomorrow,
      currentDate: today,
      isInvoiceIssued: false,
    };

    const resultFuture = determineDealUnbilledFlag(dealDataWithFutureDueDate);

    // 期待結果: フラグが false で未付与
    expect(resultFuture).toEqual({
      dealId: "DEAL002",
      hasUnbilledFlag: false,
      delayStatus: "期限内",
      daysOverdue: 0,
    });

    // ケース3: 請求書発行予定日が本日で、かつ請求済み → フラグ未付与
    const dealDataIssuedToday = {
      dealId: "DEAL003",
      customerId: "CUST003",
      dealAmount: 750000,
      dealStatus: "受注",
      expectedBillingDate: today,
      currentDate: today,
      isInvoiceIssued: true,
    };

    const resultIssuedToday = determineDealUnbilledFlag(dealDataIssuedToday);

    // 期待結果: フラグが false (請求済みのため)
    expect(resultIssuedToday).toEqual({
      dealId: "DEAL003",
      hasUnbilledFlag: false,
      delayStatus: "請求済み",
      daysOverdue: 0,
    });

    // ケース4: 請求書発行予定日が本日より 5 日前 → 遅延日数が正しく計算される
    const fiveDaysAgo = new Date("2024-01-10T00:00:00Z");
    const dealDataMultipleDaysOverdue = {
      dealId: "DEAL004",
      customerId: "CUST004",
      dealAmount: 1000000,
      dealStatus: "受注",
      expectedBillingDate: fiveDaysAgo,
      currentDate: today,
      isInvoiceIssued: false,
    };

    const resultMultipleDaysOverdue = determineDealUnbilledFlag(
      dealDataMultipleDaysOverdue
    );

    // 期待結果: 遅延日数が 5 日で計算される
    expect(resultMultipleDaysOverdue).toEqual({
      dealId: "DEAL004",
      hasUnbilledFlag: true,
      delayStatus: "遅延",
      daysOverdue: 5,
    });

    // ケース5: ステータスが「受注」でない場合 → エラーをスロー
    const dealDataWithInvalidStatus = {
      dealId: "DEAL005",
      customerId: "CUST005",
      dealAmount: 200000,
      dealStatus: "提案中",
      expectedBillingDate: yesterdayBillingDate,
      currentDate: today,
      isInvoiceIssued: false,
    };

    expect(() =>
      determineDealUnbilledFlag(dealDataWithInvalidStatus)
    ).toThrow(/受注/);

    // ケース6: 請求書発行予定日が未設定 → エラーをスロー
    const dealDataWithoutBillingDate = {
      dealId: "DEAL006",
      customerId: "CUST006",
      dealAmount: 350000,
      dealStatus: "受注",
      expectedBillingDate: null,
      currentDate: today,
      isInvoiceIssued: false,
    };

    expect(() =>
      determineDealUnbilledFlag(dealDataWithoutBillingDate as any)
    ).toThrow(/請求書/);
  });
});