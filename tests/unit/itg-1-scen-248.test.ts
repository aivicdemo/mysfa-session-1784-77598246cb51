import { validateBillingDocumentContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-248
  test('帳票内容検証機能 - 商談金額が空（未入力）の場合、警告を表示する', () => {
    const deal = {
      dealId: 'DEAL-001',
      dealName: '新規契約案件',
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      dealStage: '提案中',
      dealAmount: undefined,
      items: [
        {
          itemId: 'ITEM-001',
          productName: 'サービスA',
          quantity: 1,
          unitPrice: 100000,
        },
      ],
    };

    expect(() => validateBillingDocumentContent(deal)).toThrow(/商談金額/);
  });
});