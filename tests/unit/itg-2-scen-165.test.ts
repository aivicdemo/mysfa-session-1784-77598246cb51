import { sendQuoteNotificationWithRetry } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-165
  test("Google Workspace メール API連携 - メール送信が失敗した場合、最大5回の指数バックオフ再試行が実行される", async () => {
    const call_timestamps: number[] = [];
    const expected_retry_intervals = [5000, 10000, 20000, 40000, 80000];

    const mock_notification_service = {
      sendQuoteNotification: jest.fn(async () => {
        call_timestamps.push(Date.now());
        throw new Error("Email delivery failed");
      }),
    };

    const quote_input = {
      quoteId: "QT-001",
      customerId: "CUST-123",
      customerEmail: "customer@example.com",
      quoteAmount: 150000,
      validUntilDate: "2024-12-31",
    };

    const start_time = Date.now();
    let final_error: Error | null = null;

    try {
      await sendQuoteNotificationWithRetry(
        quote_input,
        mock_notification_service
      );
    } catch (error) {
      final_error = error as Error;
    }

    expect(final_error).toBeDefined();
    expect(final_error?.message).toMatch(/Email delivery failed/);

    expect(mock_notification_service.sendQuoteNotification).toHaveBeenCalledTimes(
      6
    );

    expect(mock_notification_service.sendQuoteNotification).toHaveBeenCalledWith(
      quote_input
    );

    expect(call_timestamps.length).toBe(6);

    for (let i = 1; i < call_timestamps.length; i++) {
      const interval = call_timestamps[i] - call_timestamps[i - 1];
      const expected_interval = expected_retry_intervals[i - 1];
      const tolerance = 500;

      expect(Math.abs(interval - expected_interval)).toBeLessThanOrEqual(
        tolerance
      );
    }

    const total_duration = call_timestamps[call_timestamps.length - 1] - start_time;
    const expected_total_duration =
      expected_retry_intervals.reduce((sum, interval) => sum + interval, 0);
    const expected_total_with_tolerance = expected_total_duration + 500;

    expect(total_duration).toBeLessThanOrEqual(expected_total_with_tolerance);
  });
});