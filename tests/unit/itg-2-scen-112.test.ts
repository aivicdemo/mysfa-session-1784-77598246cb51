import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { validateInvoiceForApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータルでの商談情報参照機能', () => {
  // SCEN-112: [error] 請求書承認検証機能 - 請求書が紐付く商談情報が存在しないとき、検証エラーが発生する
  test('請求書に紐付く商談情報が存在しない場合、検証エラーが発生する', () => {
    const invoiceId = 'INV-TEST-001';
    const invoiceAmount = 10000;
    const invoiceDate = new Date('2024-01-15T00:00:00Z');
    const initialInvoiceStatus = '承認待ち';

    // 商談情報が存在しないスタブ
    const dealRepositoryStub = {
      findByInvoiceId: jest.fn().mockResolvedValue(null),
    };

    // 検証処理の実行
    const validateFn = () => validateInvoiceForApproval(
      {
        invoiceId,
        amount: invoiceAmount,
        invoiceDate,
        status: initialInvoiceStatus,
      },
      dealRepositoryStub
    );

    // 期待結果の検証
    expect(validateFn).toThrow(/DEAL_NOT_FOUND/);
  });
});