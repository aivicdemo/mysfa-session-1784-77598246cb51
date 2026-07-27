import { reconcileSalesAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-922: 売上実績が0件の場合、空の結果セットが返される', () => {
    // Arrange: 売上実績データソースのスタブ（0件を返す）
    const salesDataSourceStub = {
      fetchSalesRecords: jest.fn().mockResolvedValue([]),
    };

    // Arrange: 請求データソースのスタブ（1件以上を返す）
    const invoiceDataSourceStub = {
      fetchInvoiceRecords: jest.fn().mockResolvedValue([
        {
          invoiceId: 'INV-001',
          customerId: 'CUST-001',
          amount: 100000,
          issuedDate: '2024-04-01',
          dueDate: '2024-04-30',
          status: 'issued',
        },
      ]),
    };

    // Arrange: 照合対象期間を指定
    const reconciliationPeriod = {
      startDate: '2024-04-01',
      endDate: '2024-04-30',
    };

    // Act: 照合機能を実行
    const result = reconcileSalesAndInvoices(
      salesDataSourceStub,
      invoiceDataSourceStub,
      reconciliationPeriod
    );

    // Assert: 空の結果セット（長さ0の配列）が返される
    expect(result).toEqual([]);
    expect(result.length).toBe(0);

    // Assert: 期待通りにデータソースのメソッドが呼び出されたことを確認
    expect(salesDataSourceStub.fetchSalesRecords).toHaveBeenCalledWith(
      reconciliationPeriod
    );
    expect(invoiceDataSourceStub.fetchInvoiceRecords).toHaveBeenCalledWith(
      reconciliationPeriod
    );
  });
});