import { ReconciliationService } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-508
  test('商談ステータスが「受注」で請求書が0件のとき、未請求として検出される', async () => {
    // Arrange
    const deal_id = 'DEAL-508';
    const customer_name = 'テスト顧客';
    const contract_amount = 100000;
    const contract_date = new Date('2024-01-15T00:00:00Z');
    const now = new Date('2024-01-15T11:00:00Z');

    // Mock DocumentStorageAdapter: 請求書検索が空配列を返す
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
      getInvoicesByDealId: jest.fn(async (deal_id: string) => []),
    };

    // Mock DiscrepancyLogRepository: ログ作成と取得
    const discrepancyLogs: Array<{
      deal_id: string;
      status: string;
      invoice_count: number;
      discrepancy_type: string;
      detected_at: Date;
    }> = [];

    const mockDiscrepancyLogRepository = {
      create: jest.fn(async (log) => {
        discrepancyLogs.push(log);
        return log;
      }),
      findByDealId: jest.fn(async (deal_id: string) => {
        return discrepancyLogs.filter((log) => log.deal_id === deal_id);
      }),
    };

    // Mock Deal Repository: 受注ステータスの商談レコード
    const mockDealRepository = {
      findById: jest.fn(async (deal_id: string) => {
        if (deal_id === 'DEAL-508') {
          return {
            deal_id: 'DEAL-508',
            customer_name: 'テスト顧客',
            status: '受注',
            contract_amount: 100000,
            contract_date: new Date('2024-01-15T00:00:00Z'),
          };
        }
        return null;
      }),
    };

    const reconciliationService = new ReconciliationService(
      mockDocumentStorageAdapter,
      mockDiscrepancyLogRepository,
      mockDealRepository
    );

    // Act
    await reconciliationService.reconcileDealWithInvoices(deal_id, now);

    // Assert
    // DocumentStorageAdapterの請求書検索メソッドが呼び出されたことを確認
    expect(mockDocumentStorageAdapter.getInvoicesByDealId).toHaveBeenCalledWith(
      'DEAL-508'
    );
    expect(mockDocumentStorageAdapter.getInvoicesByDealId).toHaveBeenCalledTimes(
      1
    );

    // 不整合検出ログが1件作成されたことを確認
    const logs = await mockDiscrepancyLogRepository.findByDealId('DEAL-508');
    expect(logs).toHaveLength(1);

    // ログの内容を検証
    const log = logs[0];
    expect(log.deal_id).toBe('DEAL-508');
    expect(log.status).toBe('受注');
    expect(log.invoice_count).toBe(0);
    expect(log.discrepancy_type).toBe('UNISSUED_INVOICE');

    // 検出タイムスタンプが現在時刻±1秒以内
    const timestamp = new Date(log.detected_at).getTime();
    const nowTime = new Date('2024-01-15T11:00:00Z').getTime();
    const diff = Math.abs(timestamp - nowTime);
    expect(diff).toBeLessThanOrEqual(1000); // 1秒以内

    // 管理画面表示用の形式を確認
    expect(log.discrepancy_type).toMatch(/UNISSUED_INVOICE/);
  });
});