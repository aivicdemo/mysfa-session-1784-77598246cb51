import { describe, test, expect, jest, beforeEach, afterEach } from "@jest/globals";
import { sendQuoteNotificationWithRetry } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能 - メール送信リトライ", () => {
  // SCEN-1007
  test("Google Workspace メール API連携 - メール送信が失敗した場合、指数バックオフで最大5回の再試行が実行される", async () => {
    const callTimestamps: number[] = [];
    const maxRetries = 5;
    const backoffDelayMs = [5000, 10000, 20000, 40000, 80000];

    let callCount = 0;
    const mockMailApiStub = jest.fn(async () => {
      callTimestamps.push(Date.now());
      callCount++;

      if (callCount < maxRetries) {
        throw new Error("TEMPORARY_NETWORK_ERROR");
      }

      return { success: true, messageId: "msg_12345", deliveredAt: new Date().toISOString() };
    });

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(async (quoteData) => {
        return sendQuoteNotificationWithRetry(quoteData, mockMailApiStub);
      }),
    };

    const quotePayload = {
      quoteId: "QUOTE_001",
      customerId: "CUST_A001",
      customerEmail: "customer@example.com",
      customerName: "Example Corp",
      quoteAmount: 500000,
      quoteDateIso: "2024-01-15T10:00:00Z",
      quoteItems: [
        {
          itemId: "ITEM_001",
          description: "Service A",
          quantity: 1,
          unitPrice: 500000,
        },
      ],
    };

    const result = await mockNotificationServiceAdapter.sendQuoteNotification(quotePayload);

    expect(mockMailApiStub).toHaveBeenCalledTimes(maxRetries);
    expect(result).toEqual({
      success: true,
      messageId: "msg_12345",
      deliveredAt: expect.any(String),
    });

    expect(callTimestamps.length).toBe(maxRetries);

    const interval_1_to_2 = callTimestamps[1] - callTimestamps[0];
    const interval_2_to_3 = callTimestamps[2] - callTimestamps[1];
    const interval_3_to_4 = callTimestamps[3] - callTimestamps[2];
    const interval_4_to_5 = callTimestamps[4] - callTimestamps[3];

    const toleranceMs = 500;

    expect(interval_1_to_2).toBeGreaterThanOrEqual(backoffDelayMs[0] - toleranceMs);
    expect(interval_1_to_2).toBeLessThanOrEqual(backoffDelayMs[0] + toleranceMs);

    expect(interval_2_to_3).toBeGreaterThanOrEqual(backoffDelayMs[1] - toleranceMs);
    expect(interval_2_to_3).toBeLessThanOrEqual(backoffDelayMs[1] + toleranceMs);

    expect(interval_3_to_4).toBeGreaterThanOrEqual(backoffDelayMs[2] - toleranceMs);
    expect(interval_3_to_4).toBeLessThanOrEqual(backoffDelayMs[2] + toleranceMs);

    expect(interval_4_to_5).toBeGreaterThanOrEqual(backoffDelayMs[3] - toleranceMs);
    expect(interval_4_to_5).toBeLessThanOrEqual(backoffDelayMs[3] + toleranceMs);
  });
});