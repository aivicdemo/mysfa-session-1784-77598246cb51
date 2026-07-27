import { describe, test, expect } from '@jest/globals';
import { updateDealStatusToContracted } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談ステータス更新・請求データ紐付け機能', () => {
  // SCEN-226: 商談ステータスを成約に変更する際、明細データの合計金額と商談金額が不一致の場合にステータス更新が拒否される
  test('should reject status update when invoice line items total does not match deal amount', () => {
    const dealId = 'DEAL-001';
    const dealAmount = 100000;
    const invoiceLineItems = [
      { lineItemId: 'LINE-001', amount: 50000 },
      { lineItemId: 'LINE-002', amount: 40000 },
    ];
    const newStatus = 'contracted';

    const input = {
      dealId,
      dealAmount,
      invoiceLineItems,
      newStatus,
    };

    expect(() => updateDealStatusToContracted(input)).toThrow(/金額/);
  });
});