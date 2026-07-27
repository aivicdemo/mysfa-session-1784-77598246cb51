import { reconcileSalesAndInvoice } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-652
  test('対象売上実績が1件のとき、その1件の照合結果が返される', () => {
    // Arrange: 売上実績と請求書のテストデータを準備
    const salesRecordId = 'SR-001';
    const invoiceId = 'INV-001';
    const customerId = 'CUST-A';
    const amount = 100000;
    const salesDate = '2024-01-15';
    const invoiceDate = '2024-01-20';

    const salesRecord = {
      id: salesRecordId,
      customerId: customerId,
      amount: amount,
      date: salesDate,
      status: '未照合',
    };

    const invoice = {
      id: invoiceId,
      customerId: customerId,
      amount: amount,
      date: invoiceDate,
      status: '未照合',
    };

    const mockDataSource = {
      getSalesRecord: jest.fn().mockReturnValue(salesRecord),
      getInvoiceByCustomerId: jest.fn().mockReturnValue(invoice),
      updateSalesRecordStatus: jest.fn(),
      updateInvoiceStatus: jest.fn(),
    };

    // Act: 照合処理を実行
    const result = reconcileSalesAndInvoice(
      salesRecordId,
      mockDataSource
    );

    // Assert: 照合結果を検証
    expect(result).toEqual({
      targetSalesRecordId: 'SR-001',
      targetInvoiceId: 'INV-001',
      amountMatched: true,
      reconciliationStatus: '完全一致',
      differencAmount: 0,
    });

    // Assert: ステータス更新が呼び出されたことを検証
    expect(mockDataSource.updateSalesRecordStatus).toHaveBeenCalledWith(
      'SR-001',
      '照合済み'
    );
    expect(mockDataSource.updateInvoiceStatus).toHaveBeenCalledWith(
      'INV-001',
      '照合済み'
    );
  });
});