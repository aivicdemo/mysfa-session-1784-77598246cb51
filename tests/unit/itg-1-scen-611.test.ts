import { generatePaymentLink } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-611
  test('PaymentGatewayAdapterのgeneratePaymentLinkが1回目失敗時、指数バックオフで再試行する', async () => {
    const invoiceId = 'INV-20240415-001';
    const invoiceAmount = 150000;
    const expectedPaymentLink = 'https://payment.example.com/link/xxx';
    
    let callCount = 0;
    const callTimestamps: number[] = [];
    
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(async (invId: string, amount: number) => {
        callCount += 1;
        const currentTimestamp = Date.now();
        callTimestamps.push(currentTimestamp);
        
        if (callCount === 1) {
          const error = new Error('決済ゲートウェイサービス一時利用不可');
          (error as any).code = 'GATEWAY_UNAVAILABLE';
          throw error;
        }
        
        return expectedPaymentLink;
      }),
    };

    const startTime = Date.now();
    const result = await generatePaymentLink(
      invoiceId,
      invoiceAmount,
      mockPaymentGatewayAdapter
    );

    const elapsedTime = callTimestamps[1] - callTimestamps[0];
    const expectedRetryDelay = 1000;
    const toleranceMs = 200;

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(2);
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenNthCalledWith(
      1,
      invoiceId,
      invoiceAmount
    );
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenNthCalledWith(
      2,
      invoiceId,
      invoiceAmount
    );
    expect(elapsedTime).toBeGreaterThanOrEqual(expectedRetryDelay - toleranceMs);
    expect(elapsedTime).toBeLessThanOrEqual(expectedRetryDelay + toleranceMs);
    expect(result).toBe(expectedPaymentLink);
  });
});