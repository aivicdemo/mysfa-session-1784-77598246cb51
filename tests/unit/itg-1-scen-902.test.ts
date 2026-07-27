import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-902
  test('請求書承認検証機能 - 請求書の支払期限が本日より過去のとき検証が不合格になる', () => {
    // 準備: テスト用の請求書データを準備
    const today = new Date('2024-01-15T00:00:00Z');
    const pastDueDate = new Date('2024-01-14T00:00:00Z');

    const invoiceData = {
      invoiceId: 'INV-001',
      customerId: 'CUST-001',
      customerName: 'テスト顧客',
      invoiceAmount: 100000,
      invoiceDate: new Date('2024-01-15T00:00:00Z'),
      dueDate: pastDueDate,
      items: [
        {
          itemId: 'ITEM-001',
          description: '商品A',
          quantity: 1,
          unitPrice: 100000,
          lineTotal: 100000,
        },
      ],
    };

    // 実行: 請求書承認検証機能を実行
    const result = () => validateInvoiceApproval(invoiceData, today);

    // 検証: 検証が不合格となり、支払期限エラーが発生する
    expect(result).toThrow(/支払期限/);
  });
});