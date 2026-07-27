import { generateQuoteWithRetry } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-1028: Gmail連携 - メール送信が失敗した場合、最大2回の再試行が5分間隔で実行される", async () => {
    jest.useFakeTimers();

    const callLog: Array<{ timestamp: number; status: string }> = [];
    const currentTime = { value: 0 };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(async () => {
        const callTimestamp = currentTime.value;
        callLog.push({
          timestamp: callTimestamp,
          status: "pending",
        });

        if (callLog.length === 1) {
          callLog[callLog.length - 1].status = "failed";
          throw new Error("メール送信失敗");
        }

        if (callLog.length === 2) {
          callLog[callLog.length - 1].status = "failed";
          throw new Error("メール送信失敗");
        }

        if (callLog.length === 3) {
          callLog[callLog.length - 1].status = "success";
          return { success: true, messageId: "msg-123" };
        }

        throw new Error("予期しない呼び出し");
      }),
    };

    const quoteData = {
      quote_id: "QUOTE-001",
      customer_name: "顧客A",
      customer_email: "customer_a@example.com",
      quote_amount: 500000,
      quote_date: "2024-01-15",
    };

    const processQuoteTask = generateQuoteWithRetry(
      quoteData,
      mockNotificationServiceAdapter
    );

    await jest.runAllTimersAsync();

    const advanceTime = async (milliseconds: number) => {
      currentTime.value += milliseconds;
      jest.advanceTimersByTime(milliseconds);
      await jest.runAllTimersAsync();
    };

    await processQuoteTask;

    expect(callLog).toHaveLength(3);
    expect(callLog[0]).toEqual({
      timestamp: 0,
      status: "failed",
    });
    expect(callLog[1]).toEqual({
      timestamp: 300000,
      status: "failed",
    });
    expect(callLog[2]).toEqual({
      timestamp: 600000,
      status: "success",
    });

    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledTimes(
      3
    );

    const timeBetweenFirstAndSecond =
      callLog[1].timestamp - callLog[0].timestamp;
    const timeBetweenSecondAndThird =
      callLog[2].timestamp - callLog[1].timestamp;

    expect(timeBetweenFirstAndSecond).toBe(300000);
    expect(timeBetweenSecondAndThird).toBe(300000);

    jest.useRealTimers();
  });
});