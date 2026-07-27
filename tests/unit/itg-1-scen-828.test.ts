import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-828
  test('請求対象データ妥当性検証機能 - 請求金額が業務上の最大金額（9,999,999,999円）のとき、正常な金額として検証を続行する', () => {
    // Arrange: テスト対象の請求対象データ妥当性検証機能を初期化
    const invoiceDataWithMaxAmount = {
      invoiceAmount: 9999999999,
      customerId: 'CUST-001',
      customerName: 'Test Customer Inc.',
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      lineItems: [
        {
          itemId: 'ITEM-001',
          itemName: 'Service A',
          quantity: 1,
          unitPrice: 5000000000,
          amount: 5000000000
        },
        {
          itemId: 'ITEM-002',
          itemName: 'Service B',
          quantity: 1,
          unitPrice: 4999999999,
          amount: 4999999999
        }
      ]
    };

    // Act: 妥当性検証処理を実行
    const validationResult = validateInvoiceData(invoiceDataWithMaxAmount);

    // Assert: 検証ロジックが金額の上限チェックを通過したことを確認
    expect(validationResult.isValid).toBe(true);

    // Assert: 検証結果のステータスが『正常』であることをアサート
    expect(validationResult.status).toBe('VALID');

    // Assert: エラーメッセージが空配列であることを確認
    expect(validationResult.errors).toEqual([]);

    // Assert: 検証プロセスが次のステップへ進行可能な状態であることを確認
    expect(validationResult.canProceedToNextStep).toBe(true);
  });
});