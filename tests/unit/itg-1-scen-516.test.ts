import { detectDealInvoiceDiscrepancies } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-516: [error] 商談ステータスと請求書発行状況の自動照合・ズレ検出機能 - 商談ステータスが空白のとき、照合処理がエラーで終了する
  test('商談ステータスが空白のとき照合処理がエラーで終了する', () => {
    const dealRecord = {
      dealId: 'DEAL-001',
      customerName: 'テスト顧客A',
      amount: 100000,
      status: null,
      createdAt: new Date('2024-01-15T09:00:00Z'),
    };

    const invoiceRecord = {
      invoiceId: 'INV-2024-001',
      dealId: 'DEAL-001',
      amount: 100000,
      issueStatus: '発行済み',
      issuedAt: new Date('2024-01-15T10:00:00Z'),
    };

    const mockDatabase = {
      deals: [dealRecord],
      invoices: [invoiceRecord],
      discrepancyLogs: [] as any[],
      processLogs: [] as any[],
    };

    const mockProcessLogEntry = {
      dealId: 'DEAL-001',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      eventType: 'ERROR',
      message: expect.any(String),
    };

    expect(() => {
      detectDealInvoiceDiscrepancies(dealRecord.dealId, mockDatabase);
    }).toThrow(/ステータス|ステータス未設定|ステータスが空白/);

    expect(mockDatabase.discrepancyLogs.length).toBe(0);
    expect(mockDatabase.processLogs.length).toBeGreaterThan(0);
    expect(mockDatabase.processLogs[0].dealId).toBe('DEAL-001');
    expect(mockDatabase.processLogs[0].eventType).toBe('ERROR');
  });
});