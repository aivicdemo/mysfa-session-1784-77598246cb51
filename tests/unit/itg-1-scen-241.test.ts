import { validateDocumentContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-241
  test('帳票内容検証機能 - 顧客情報・商談金額・明細すべてが入力済みの場合、検証成功と判定される', () => {
    const customerInfo = {
      customerName: '株式会社テスト',
      customerCode: 'CUST001',
      contactPerson: '営業太郎',
      email: 'sales@test.co.jp',
      phone: '03-1234-5678',
      address: '東京都渋谷区テスト1-1-1',
    };

    const dealAmount = {
      amount: 500000,
      currency: 'JPY',
      dealStatus: '受注',
      dealId: 'DEAL20240115001',
      dealDate: '2024-01-15',
    };

    const lineItems = [
      {
        itemCode: 'ITEM001',
        itemName: 'ソフトウェアライセンス',
        quantity: 10,
        unitPrice: 50000,
        remark: '年間ライセンス',
      },
    ];

    const validationResult = validateDocumentContent({
      customer: customerInfo,
      deal: dealAmount,
      items: lineItems,
    });

    expect(validationResult.validationStatus).toBe(true);
    expect(validationResult.errors).toEqual([]);
    expect(validationResult.status).toBe('検証完了');
    expect(validationResult.totalAmount).toBe(500000);
  });
});