import {
  recordDeliveryStatus,
} from "../../src/logic/it-1784969823049-2-1-2";

interface DeliveryStatusInput {
  notificationServiceAdapter: {
    getDeliveryStatus: (messageId: string) => Promise<unknown>;
  };
  messageId: string;
}

interface DeliveryStatusResult {
  status: "recorded" | "error" | "unknown";
  errorLog?: string;
  businessResultRecord?: {
    messageId: string;
    deliveryStatus: string;
  };
}

describe("顧客向けポータル - メール配信ステータス記録処理", () => {
  // SCEN-167: Google Workspace メール API連携 - getDeliveryStatusの応答形式が想定と異なる場合、誤った配信ステータスが業務結果として記録されない
  test("想定外の応答形式（必須フィールド欠落）を受け取った場合、不正な値は記録されずエラーログが出力される", async () => {
    const messageId_fixture = "msg-001";
    const invalidResponse = {
      // 期待されるフィールドが欠落した想定外の応答形式
      timestamp: "2024-01-15T11:00:00Z",
      // ❌ deliveryStatus フィールルが欠落
    };

    const mockNotificationServiceAdapter = {
      getDeliveryStatus: jest.fn().mockResolvedValue(invalidResponse),
    };

    let recordingError: string | undefined;
    let recordedResult: DeliveryStatusResult | undefined;

    try {
      recordedResult = await recordDeliveryStatus({
        notificationServiceAdapter: mockNotificationServiceAdapter,
        messageId: messageId_fixture,
      });
    } catch (error) {
      recordingError = String(error);
    }

    // 想定外の応答形式を検出し、不正な値を記録しないこと
    expect(recordedResult).toBeDefined();
    expect(recordedResult?.status).toBe("error");

    // エラーログが出力されること
    expect(recordedResult?.errorLog).toBeDefined();
    expect(recordedResult?.errorLog).toMatch(/配信ステータス/);

    // 業務結果テーブルに不正なレコードが記録されていないこと
    expect(recordedResult?.businessResultRecord).toBeUndefined();
  });
});