import { describe, test, expect } from '@jest/globals';
import { validateDealClosureDateOnReconciliation } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-635
  test('商談ステータスがクローズで、クローズ日が空のとき、バリデーションエラーが発生する', () => {
    const dealRecord = {
      dealId: 'DEAL-001',
      dealName: 'テスト商談001',
      customerId: 'CUST-A',
      customerName: 'テスト顧客A',
      dealAmount: 1000000,
      dealStatus: 'クローズ',
      closedDate: null,
      invoiceIssuedDate: '2024-04-15',
      invoiceAmount: 1000000,
    };

    const result = validateDealClosureDateOnReconciliation(dealRecord);

    expect(result.hasError).toBe(true);
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0]).toEqual({
      code: 'VALIDATION_ERROR_CLOSE_DATE_REQUIRED',
      message: '商談ステータスがクローズの場合、クローズ日は必須です',
    });
    expect(result.recordSaved).toBe(false);
  });
});