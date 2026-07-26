import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  reconcileSalesAndBillingData,
  type ReconcileSalesAndBillingInput,
  type ReconcileSalesAndBillingOutput,
} from "../../src/logic/it-1784969823049-2-1-2";

const fetchMock = require("jest-fetch-mock");

describe("顧客向けポータル - 売上実績と請求状況の照合機能", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-051
  test("商談データと請求データが両方存在しない場合、エラーメッセージが表示される", async () => {
    const customerId = "CUST-99999";
    const portalUserId = "USER-PORTAL-001";
    const reconciliationDate = new Date("2024-01-15T09:00:00Z");

    const input: ReconcileSalesAndBillingInput = {
      customerId: customerId,
      portalUserId: portalUserId,
      reconciliationDate: reconciliationDate,
    };

    // Mock: 商談データ取得エンドポイント - データ存在しない
    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 404,
        data: null,
        errorCode: "DEAL_NOT_FOUND",
        message: "指定された顧客の商談データが見つかりません",
      }),
      { status: 404 }
    );

    // Mock: 請求データ取得エンドポイント - データ存在しない
    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 404,
        data: null,
        errorCode: "BILLING_NOT_FOUND",
        message: "指定された顧客の請求データが見つかりません",
      }),
      { status: 404 }
    );

    // Mock: エラーログ記録エンドポイント
    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 200,
        logId: "LOG-20240115-001",
        recorded: true,
      }),
      { status: 200 }
    );

    const result: ReconcileSalesAndBillingOutput = await reconcileSalesAndBillingData(
      input
    );

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("NO_DATA_TO_RECONCILE");
    expect(result.errorMessage).toMatch(/照合対象となるデータが見つかりません/);
    expect(result.statusCode).toBe(404);
    expect(result.dealDataExists).toBe(false);
    expect(result.billingDataExists).toBe(false);
    expect(result.reconciliationDetails).toBeNull();
    expect(result.errorLogRecorded).toBe(true);
    expect(result.errorLogId).toBe("LOG-20240115-001");
    expect(result.timestamp).toBeDefined();
  });
});