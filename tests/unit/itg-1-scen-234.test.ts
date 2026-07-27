import {
  updateDealStatusAndVerifyInvoice
} from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-234
  test('商談ステータスを成約に変更する際、既存の請求書がある場合に重複を検出してステータス更新に失敗する', () => {
    const dealId = 'DEAL-001';
    const customerId = 'CUST-100';
    const invoiceId = 'INV-001';
    const invoiceAmount = 100000;
    const currentStatus = '交渉中';
    const targetStatus = '成約';
    const expectedErrorCode = 'DUPLICATE_INVOICE_DETECTED';
    const expectedErrorMessage = '既存の請求書が紐付けられています。重複登録はできません';

    // テストデータ: 既存の請求書が紐付いている状態
    const mockExistingInvoice = {
      invoiceId: invoiceId,
      dealId: dealId,
      customerId: customerId,
      amount: invoiceAmount,
      status: '未送付',
      createdAt: '2024-01-10T09:00:00Z'
    };

    const mockDealRecord = {
      dealId: dealId,
      customerId: customerId,
      status: currentStatus,
      amount: 100000,
      createdAt: '2024-01-01T10:00:00Z'
    };

    // 請求書照合ロジックを検証するためのスタブ
    const invoiceLookupStub = jest.fn().mockReturnValue(mockExistingInvoice);

    // ステータス更新をリクエスト
    const updateRequest = {
      dealId: dealId,
      targetStatus: targetStatus
    };

    // 実行: 照合ロジックが既存請求書を検出してエラーを発行することを期待
    expect(() => {
      updateDealStatusAndVerifyInvoice(
        updateRequest,
        mockDealRecord,
        invoiceLookupStub
      );
    }).toThrow(/重複/);

    // 照合ロジックが実際に呼ばれたことを確認
    expect(invoiceLookupStub).toHaveBeenCalledWith(dealId);

    // 返却されるエラーレスポンスの構造を検証
    try {
      updateDealStatusAndVerifyInvoice(
        updateRequest,
        mockDealRecord,
        invoiceLookupStub
      );
    } catch (error) {
      const caughtError = error as { code: string; message: string };
      expect(caughtError.code).toBe(expectedErrorCode);
      expect(caughtError.message).toContain(expectedErrorMessage);
    }

    // ステータスが変更されていないことを確認
    expect(mockDealRecord.status).toBe(currentStatus);
  });
});