import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { determineStagedRoutingTarget } from "../../src/logic/it-1784969823049-1-1-1";

const mockNotificationServiceAdapter = {
  sendQuoteNotification: jest.fn(),
  sendOrderNotification: jest.fn(),
  sendInvoiceNotification: jest.fn(),
  getDeliveryStatus: jest.fn(),
};

const mockSalesforceMetadataDataSource = {
  fetchLicenseUsers: jest.fn(),
  fetchEditionDetails: jest.fn(),
  fetchFeatureUsageMetrics: jest.fn(),
  fetchAnnualCostData: jest.fn(),
};

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-697
  it("段階的対応ルーティング機能 - 照合結果が確定後、営業管理者への報告期限が2営業日前ジャストの場合、報告対象に含まれる", () => {
    // 前提: 月次決算期限が設定され、商談ステータスと請求書発行状況のデータが営業管理システムに存在する状態
    // 発生条件: 月次決算期限の3営業日前に、経理担当者が商談ステータスと請求書発行状況の照合を開始する
    // 結果: 未請求案件と遅延案件を自動検出し、対応SLA（営業管理者への報告は期限2営業日前、営業担当者への対応指示は期限1営業日前）に従って段階的に対応を進める

    // 営業カレンダー設定: 月〜金が営業日、土日が非営業日
    // 月次決算期限: 2024年4月30日（火）
    // 本日: 2024年4月25日（木）= 決算期限の3営業日前
    // 報告期限（営業管理者向け）: 2024年4月26日（金）= 決算期限の2営業日前
    const businessCalendar = {
      businessDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      monthlyDeadline: new Date("2024-04-30T23:59:59Z"), // 火曜日
      currentDate: new Date("2024-04-25T10:00:00Z"), // 木曜日
    };

    // テスト用案件データ
    // 照合結果が確定、報告期限が2営業日前のジャスト
    const dealRecord = {
      dealId: "DEAL-20240425-001",
      customerId: "CUST-001",
      dealStatus: "received", // 受注ステータス
      dealAmount: 500000,
      quoteIssuedDate: new Date("2024-04-20T09:00:00Z"),
      invoiceIssuedDate: null, // 未請求状態
      reconciliationStatus: "confirmed", // 照合結果が確定
      reconciliationCompletedAt: new Date("2024-04-24T15:30:00Z"),
      reportingDeadlineForManager: new Date("2024-04-26T17:00:00Z"), // 2営業日前のジャスト（営業時間内）
      reportingDeadlineForSalesRep: new Date("2024-04-29T17:00:00Z"), // 1営業日前
      isReportingTarget: false,
    };

    // ステージング対象判定ロジック実行
    // 営業管理者への報告期限が「本日から見て2営業日前のジャスト」かどうかを判定
    const result = determineStagedRoutingTarget(
      dealRecord,
      businessCalendar.currentDate,
      businessCalendar.monthlyDeadline,
      businessCalendar.businessDays,
      mockNotificationServiceAdapter
    );

    // 期待値: 報告対象に含まれる（isReportingTarget = true）
    expect(result.isReportingTarget).toBe(true);

    // 期待値: 報告対象フラグが true に設定されている
    expect(result.dealId).toBe("DEAL-20240425-001");
    expect(result.targetType).toBe("manager");

    // 期待値: NotificationServiceAdapter へのメール送信呼び出しが実行される
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();

    // 期待値: メール送信呼び出し時の引数検証
    const callArgs =
      mockNotificationServiceAdapter.sendInvoiceNotification.mock.calls[0];
    expect(callArgs).toBeDefined();
    expect(callArgs[0]).toMatchObject({
      dealId: "DEAL-20240425-001",
      customerId: "CUST-001",
      recipientType: "manager",
    });

    // 期待値: 照合結果が確定状態であることを確認
    expect(result.reconciliationStatus).toBe("confirmed");

    // 期待値: 返却データに報告期限情報が含まれている
    expect(result.reportingDeadlineForManager).toEqual(
      new Date("2024-04-26T17:00:00Z")
    );
  });
});