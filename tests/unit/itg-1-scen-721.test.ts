import { reconcileStatusWithExternalSystem } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-721: [error] ステータス照合ロジック - 商談ステータス更新日が空の場合、照合は実行されない
  test('ステータス更新日がnullの場合、外部サービスへの呼び出しは実行されない', () => {
    const mockExternalDataSource = {
      fetchDealStatusData: jest.fn(),
      fetchInvoiceData: jest.fn(),
    };

    const mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const dealData = {
      dealId: 'deal-001',
      status: '交渉中',
      statusUpdatedAt: null,
      amount: 500000,
      customerId: 'cust-001',
    };

    const result = reconcileStatusWithExternalSystem(
      dealData,
      mockExternalDataSource,
      mockLogger
    );

    expect(mockExternalDataSource.fetchDealStatusData).toHaveBeenCalledTimes(0);
    expect(mockExternalDataSource.fetchInvoiceData).toHaveBeenCalledTimes(0);
    expect(result.status).toBe('交渉中');
    expect(result.reconciliationSkipped).toBe(true);
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('ステータス更新日が空のため照合をスキップしました')
    );
  });
});