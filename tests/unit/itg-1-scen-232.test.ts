import { updateDealStatusAndSendInvoiceNotification } from '../../src/logic/it-1-1';

interface NotificationServiceAdapter {
  sendInvoiceNotification: (customerId: string, email: string, invoiceInfo: object) => Promise<{ status: number }>;
}

interface DealRecord {
  dealId: string;
  customerId: string;
  status: string;
  amount: number;
  invoiceIssuedAt?: string;
}

// Mock database
const mockDatabase: Map<string, DealRecord> = new Map();

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-232
  test('商談ステータスを成約に変更した場合、NotificationServiceAdapterで請求書発行通知メールが正常に送信される', async () => {
    // Setup: テストデータをセットアップ
    const testCustomerId = 'CUST-001';
    const testCustomerEmail = 'customer@example.com';
    const testDealId = 'DEAL-001';
    const testDealAmount = 100000;

    const initialDealRecord: DealRecord = {
      dealId: testDealId,
      customerId: testCustomerId,
      status: 'progress',
      amount: testDealAmount,
    };

    mockDatabase.set(testDealId, initialDealRecord);

    // Mock NotificationServiceAdapter
    let sendInvoiceNotificationCallCount = 0;
    let capturedCallArgs: {
      customerId: string;
      email: string;
      invoiceInfo: object;
    } | null = null;

    const mockNotificationAdapter: NotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn(async (customerId: string, email: string, invoiceInfo: object) => {
        sendInvoiceNotificationCallCount += 1;
        capturedCallArgs = { customerId, email, invoiceInfo };
        return { status: 200 };
      }),
    };

    // Mock database retrieval function
    const mockGetDeal = jest.fn((dealId: string): DealRecord | undefined => {
      return mockDatabase.get(dealId);
    });

    // Mock database update function
    const mockUpdateDeal = jest.fn((dealId: string, updates: Partial<DealRecord>): void => {
      const existing = mockDatabase.get(dealId);
      if (existing) {
        mockDatabase.set(dealId, { ...existing, ...updates });
      }
    });

    // Mock customer retrieval
    const mockGetCustomer = jest.fn((customerId: string) => ({
      customerId: testCustomerId,
      email: testCustomerEmail,
      name: 'Test Customer',
    }));

    // Execute: 商談ステータス更新処理を実行
    const responseStatus = await updateDealStatusAndSendInvoiceNotification(
      testDealId,
      'completed',
      mockNotificationAdapter,
      mockGetDeal,
      mockUpdateDeal,
      mockGetCustomer,
    );

    // Verify: 商談ステータスが「成約」に更新されたことを確認
    const updatedDeal = mockDatabase.get(testDealId);
    expect(updatedDeal?.status).toBe('completed');

    // Verify: NotificationServiceAdapterのsendInvoiceNotificationメソッドが呼び出されたことを確認
    expect(mockNotificationAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(1);

    // Verify: 呼び出し時の引数が期待値と一致することを確認
    expect(capturedCallArgs?.customerId).toBe(testCustomerId);
    expect(capturedCallArgs?.email).toBe(testCustomerEmail);
    expect(capturedCallArgs?.invoiceInfo).toEqual({
      dealId: testDealId,
      amount: testDealAmount,
      status: 'completed',
    });

    // Verify: メール送信完了ステータスコードが200（成功）であることを確認
    expect(responseStatus).toBe(200);

    // Verify: データベースの商談レコード内に「invoiceIssuedAt」フィールドが記録されていることを確認
    expect(updatedDeal?.invoiceIssuedAt).toBeDefined();
    expect(typeof updatedDeal?.invoiceIssuedAt).toBe('string');
  });
});