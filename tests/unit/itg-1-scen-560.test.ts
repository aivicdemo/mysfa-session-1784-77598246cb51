import { describe, test, expect } from '@jest/globals';
import { reconcileDealStatusWithInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-560
  test('商談ステータスが照合対象と大文字小文字が異なる場合、条件に該当しないと判定される', () => {
    const dealRecord = {
      dealId: 'DEAL-001',
      dealStatus: 'じゅちゅう',
      invoiceStatus: '未発行',
      targetStatus: '受注'
    };

    const result = reconcileDealStatusWithInvoice(dealRecord);

    expect(result.isMatched).toBe(false);
    expect(result.isIncludedInDetectionList).toBe(false);
    expect(result.detectionReason).toBe('');
  });
});