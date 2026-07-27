import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import * as logic from '../../src/logic/it-1784969823049-1-1-1';

interface UnbilledDeal {
  dealId: string;
  customerId: string;
  amount: number;
  contractDate: string;
  status: string;
  discrepancyDetails: string;
}

interface DetectionResult {
  unbilledDeals: UnbilledDeal[];
  totalCount: number;
  executedAt: string;
}

interface MockAdapter {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
  sendQuoteNotification: jest.Mock;
  sendOrderNotification: jest.Mock;
  sendInvoiceNotification: jest.Mock;
  getDeliveryStatus: jest.Mock;
  generatePaymentLink: jest.Mock;
  verifyPayment: jest.Mock;
  getTransactionStatus: jest.Mock;
}

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  let documentStorageAdapter: MockAdapter;
  let notificationServiceAdapter: MockAdapter;
  let paymentGatewayAdapter: MockAdapter;
  let testDealData: Array<{
    dealId: string;
    customerId: string;
    amount: number;
    contractDate: string;
    status: string;
    invoiceIssuedStatus: string;
  }>;

  beforeEach(() => {
    // スタブ初期化
    documentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ fileId: 'doc-001', url: 'https://example.com/doc' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://example.com/share-001' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    notificationServiceAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: 'msg-001', delivered: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: 'msg-002', delivered: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ messageId: 'msg-003', delivered: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ opened: false, deliveredAt: '2024-01-15T10:00:00Z' }),
    };

    paymentGatewayAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.example.com/link-001', expiresAt: '2024-01-22T23:59:59Z' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: false, transactionId: null }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'pending', amount: 0 }),
    };

    // テスト用DB初期化：5件以上の未請求案件データ
    testDealData = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-A001',
        amount: 150000,
        contractDate: '2024-01-05T09:30:00Z',
        status: '成約',
        invoiceIssuedStatus: '未発行',
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-B002',
        amount: 250000,
        contractDate: '2024-01-08T14:15:00Z',
        status: '成約',
        invoiceIssuedStatus: '未発行',
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-C003',
        amount: 75000,
        contractDate: '2024-01-10T11:00:00Z',
        status: '成約',
        invoiceIssuedStatus: '未発行',
      },
      {
        dealId: 'DEAL-004',
        customerId: 'CUST-D004',
        amount: 320000,
        contractDate: '2024-01-12T16:45:00Z',
        status: '成約',
        invoiceIssuedStatus: '未発行',
      },
      {
        dealId: 'DEAL-005',
        customerId: 'CUST-E005',
        amount: 180000,
        contractDate: '2024-01-14T13:20:00Z',
        status: '成約',
        invoiceIssuedStatus: '未発行',
      },
      {
        dealId: 'DEAL-006',
        customerId: 'CUST-F006',
        amount: 420000,
        contractDate: '2024-01-15T10:00:00Z',
        status: '成約',
        invoiceIssuedStatus: '未発行',
      },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-555
  test('複数件の未請求案件を複数回実行しても同じ結果が返される', async () => {
    const executedAt1 = '2024-01-20T15:30:00Z';
    const executedAt2 = '2024-01-20T15:30:00Z';
    const executedAt3 = '2024-01-20T15:30:00Z';

    // 1回目実行
    const responseA: DetectionResult = await logic.detectUnbilledAndDelayedDeals(
      testDealData,
      {
        documentStorageAdapter,
        notificationServiceAdapter,
        paymentGatewayAdapter,
      },
      executedAt1
    );

    // スタブへの呼び出し履歴を保存
    const firstExecutionDocumentCalls = documentStorageAdapter.uploadDocument.mock.calls.length;
    const firstExecutionNotificationCalls = notificationServiceAdapter.sendInvoiceNotification.mock.calls.length;
    const firstExecutionPaymentCalls = paymentGatewayAdapter.generatePaymentLink.mock.calls.length;

    // 2回目実行
    const responseB: DetectionResult = await logic.detectUnbilledAndDelayedDeals(
      testDealData,
      {
        documentStorageAdapter,
        notificationServiceAdapter,
        paymentGatewayAdapter,
      },
      executedAt2
    );

    // 3回目実行
    const responseC: DetectionResult = await logic.detectUnbilledAndDelayedDeals(
      testDealData,
      {
        documentStorageAdapter,
        notificationServiceAdapter,
        paymentGatewayAdapter,
      },
      executedAt3
    );

    // レスポンスの構造検証
    expect(responseA).toHaveProperty('unbilledDeals');
    expect(responseB).toHaveProperty('unbilledDeals');
    expect(responseC).toHaveProperty('unbilledDeals');

    // 1回目と2回目の未請求案件リスト比較
    expect(responseA.unbilledDeals.length).toBe(responseB.unbilledDeals.length);
    expect(responseA.unbilledDeals.length).toBe(6);

    // 案件IDの検証
    const dealIdsA = responseA.unbilledDeals.map((deal) => deal.dealId).sort();
    const dealIdsB = responseB.unbilledDeals.map((deal) => deal.dealId).sort();
    const dealIdsC = responseC.unbilledDeals.map((deal) => deal.dealId).sort();

    expect(dealIdsA).toEqual(dealIdsB);
    expect(dealIdsB).toEqual(dealIdsC);

    // 各案件の詳細情報が完全に一致することを検証
    for (let i = 0; i < responseA.unbilledDeals.length; i++) {
      const dealA = responseA.unbilledDeals[i];
      const dealB = responseB.unbilledDeals[i];
      const dealC = responseC.unbilledDeals[i];

      expect(dealA.dealId).toBe(dealB.dealId);
      expect(dealB.dealId).toBe(dealC.dealId);

      expect(dealA.customerId).toBe(dealB.customerId);
      expect(dealB.customerId).toBe(dealC.customerId);

      expect(dealA.amount).toBe(dealB.amount);
      expect(dealB.amount).toBe(dealC.amount);

      expect(dealA.contractDate).toBe(dealB.contractDate);
      expect(dealB.contractDate).toBe(dealC.contractDate);

      expect(dealA.status).toBe(dealB.status);
      expect(dealB.status).toBe(dealC.status);

      expect(dealA.discrepancyDetails).toBe(dealB.discrepancyDetails);
      expect(dealB.discrepancyDetails).toBe(dealC.discrepancyDetails);
    }

    // ソート順序を含めた完全一致検証
    expect(responseA.unbilledDeals).toEqual(responseB.unbilledDeals);
    expect(responseB.unbilledDeals).toEqual(responseC.unbilledDeals);

    // 総件数の検証
    expect(responseA.totalCount).toBe(6);
    expect(responseB.totalCount).toBe(6);
    expect(responseC.totalCount).toBe(6);

    // スタブへのAPI呼び出し仕様が一貫していることを検証
    expect(documentStorageAdapter.uploadDocument.mock.calls.length).toBe(firstExecutionDocumentCalls * 3);
    expect(notificationServiceAdapter.sendInvoiceNotification.mock.calls.length).toBe(firstExecutionNotificationCalls * 3);
    expect(paymentGatewayAdapter.generatePaymentLink.mock.calls.length).toBe(firstExecutionPaymentCalls * 3);

    // 呼び出しパラメータの一貫性を検証
    const documentCallsA = documentStorageAdapter.uploadDocument.mock.calls.slice(0, firstExecutionDocumentCalls);
    const documentCallsB = documentStorageAdapter.uploadDocument.mock.calls.slice(
      firstExecutionDocumentCalls,
      firstExecutionDocumentCalls * 2
    );
    const documentCallsC = documentStorageAdapter.uploadDocument.mock.calls.slice(firstExecutionDocumentCalls * 2);

    expect(JSON.stringify(documentCallsA)).toBe(JSON.stringify(documentCallsB));
    expect(JSON.stringify(documentCallsB)).toBe(JSON.stringify(documentCallsC));

    // 呼び出し順序の確認
    expect(documentStorageAdapter.uploadDocument.mock.invocationCallOrder.length).toBeGreaterThan(0);
    expect(notificationServiceAdapter.sendInvoiceNotification.mock.invocationCallOrder.length).toBeGreaterThan(0);
    expect(paymentGatewayAdapter.generatePaymentLink.mock.invocationCallOrder.length).toBeGreaterThan(0);
  });
});