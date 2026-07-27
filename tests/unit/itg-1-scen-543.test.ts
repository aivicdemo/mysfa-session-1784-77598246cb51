import { detectUnbilledCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-543
  test('ステータスが「受注」以外の案件は「未請求案件」リストに含まれない', () => {
    // テストデータベースを初期化
    const testCases = [
      {
        caseId: 'CASE-A',
        status: '受注',
        invoiceStatus: '未請求',
        amount: 100000,
      },
      {
        caseId: 'CASE-B',
        status: '見積',
        invoiceStatus: '未請求',
        amount: 150000,
      },
      {
        caseId: 'CASE-C',
        status: '商談中',
        invoiceStatus: '未請求',
        amount: 200000,
      },
      {
        caseId: 'CASE-D',
        status: '受注',
        invoiceStatus: '請求済み',
        amount: 80000,
      },
    ];

    // 外部サービスアダプタをモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ fileId: 'file-123' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://drive.google.com/file/d/abc123' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: 'msg-001' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: 'msg-002' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ messageId: 'msg-003' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: 'delivered' }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://payment.gmo.jp/link123' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true, transactionId: 'txn-456' }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed' }),
    };

    // 未請求案件リスト取得機能を実行
    const unbilledCases = detectUnbilledCases(
      testCases,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
    );

    // 戻り値のリストを検証
    expect(unbilledCases).toHaveLength(1);
    expect(unbilledCases[0].caseId).toBe('CASE-A');
    expect(unbilledCases[0].status).toBe('受注');
    expect(unbilledCases[0].invoiceStatus).toBe('未請求');
    expect(unbilledCases[0].amount).toBe(100000);
  });
});