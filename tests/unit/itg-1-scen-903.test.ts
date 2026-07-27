import { verifyInvoiceForApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 請求書承認検証機能', () => {
  // SCEN-903
  test('請求書に紐付く注文レコードが存在するとき検証が合格する', () => {
    // 準備: テスト用の請求書レコード
    const invoiceRecord = {
      invoiceId: 'INV-20240115-001',
      customerId: 'CUST-0001',
      amount: 100000,
      status: '未承認',
    };

    // 準備: テスト用の注文レコード
    const linkedOrderRecord = {
      orderId: 'ORD-20240110-001',
      customerId: 'CUST-0001',
      amount: 100000,
      invoiceId: 'INV-20240115-001',
    };

    // スタブ: データベースクエリをモック
    const mockDataSource = {
      findOrderByInvoiceId: jest.fn().mockReturnValue(linkedOrderRecord),
      updateInvoiceStatus: jest.fn().mockReturnValue({
        invoiceId: invoiceRecord.invoiceId,
        status: '検証済み',
      }),
    };

    // 実行
    const result = verifyInvoiceForApproval(invoiceRecord, mockDataSource);

    // 検証: 検証結果が合格ステータスである
    expect(result.validationStatus).toBe('PASSED');

    // 検証: 注文レコード発見フラグが true である
    expect(result.orderFoundFlag).toBe(true);

    // 検証: 紐付いた注文IDが正しい
    expect(result.linkedOrderId).toBe('ORD-20240110-001');

    // 検証: 請求書のステータスが検証済みに更新されている
    expect(result.updatedInvoiceStatus).toBe('検証済み');

    // 検証: mockDataSource のメソッドが期待どおり呼ばれたことを確認
    expect(mockDataSource.findOrderByInvoiceId).toHaveBeenCalledWith('INV-20240115-001');
    expect(mockDataSource.updateInvoiceStatus).toHaveBeenCalledWith('INV-20240115-001', '検証済み');
  });
});