import { reconcileSalesAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-931
  test('請求書レコードに商談IDが未設定の場合、売上実績との紐付けに失敗する', () => {
    const invoiceWithoutDealId = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-0001',
      dealId: null,
      amount: 100000,
      issuedDate: '2024-04-15',
      status: '照合待機',
    };

    const salesRecord = {
      salesId: 'SALES-2024-001',
      customerId: 'CUST-0001',
      dealId: 'DEAL-2024-0001',
      amount: 100000,
      recordedDate: '2024-04-15',
      linkedInvoiceId: null,
    };

    const systemLog: {
      timestamp: string;
      level: string;
      message: string;
      invoiceId: string;
    }[] = [];
    const mockLogger = {
      error: (invoiceId: string, message: string) => {
        systemLog.push({
          timestamp: new Date('2024-04-15T10:00:00Z').toISOString(),
          level: 'ERROR',
          message,
          invoiceId,
        });
      },
    };

    const result = reconcileSalesAndInvoice(
      invoiceWithoutDealId,
      salesRecord,
      mockLogger
    );

    expect(result.isSuccessful).toBe(false);
    expect(result.errorMessage).toBe(
      '商談IDが未設定のため、売上実績との照合に失敗しました。請求書レコードを確認してください'
    );
    expect(result.updatedInvoiceStatus).toBe('照合失敗');
    expect(result.salesRecordLinkedInvoiceId).toBeNull();
    expect(systemLog).toHaveLength(1);
    expect(systemLog[0].level).toBe('ERROR');
    expect(systemLog[0].invoiceId).toBe('INV-2024-001');
    expect(systemLog[0].message).toMatch(/商談ID/);
  });
});