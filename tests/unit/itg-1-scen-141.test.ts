import { updateDealStatusToContracted } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-141
  test('商談ステータスを「成約」に更新する際、顧客情報が未入力の場合、ステータス更新が拒否される', () => {
    const dealRecord = {
      dealId: 'DEAL-20240115-001',
      dealName: '営業案件A',
      customerId: '',
      customerName: '',
      customerAddress: '',
      dealAmount: 500000,
      dealStatus: '提案中',
      dealItems: [
        {
          itemId: 'ITEM-001',
          itemName: 'サービスプランA',
          quantity: 1,
          unitPrice: 500000,
        },
      ],
    };

    expect(() => updateDealStatusToContracted(dealRecord)).toThrow(/顧客情報/);
  });
});