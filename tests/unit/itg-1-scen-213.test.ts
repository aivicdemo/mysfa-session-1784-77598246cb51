import { updateDealStatusToContracted } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-213
  test('商談ステータスを成約に変更する際、必須項目チェックで明細データが0件の場合にステータス更新が拒否される', () => {
    const dealId = 'DEAL-001';
    const customerId = 'CUST-A';
    const currentStatus = '提案中';
    const targetStatus = '成約';
    const invoiceLineItemCount = 0;

    const dealInput = {
      id: dealId,
      customerId: customerId,
      status: currentStatus,
      amount: 1000000,
      invoiceLineItemCount: invoiceLineItemCount,
      targetStatus: targetStatus,
    };

    expect(() => updateDealStatusToContracted(dealInput)).toThrow(/明細/);
  });
});