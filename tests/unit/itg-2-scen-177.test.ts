import { getTransactionStatus } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-177: GMO Payment Gateway連携 - getTransactionStatusの応答形式が想定と異なる場合、誤ったトランザクションステータスが業務結果として記録されない
  test('getTransactionStatusから想定外の応答形式が返却された場合、トランザクション履歴にエラーステータスが記録され、請求書ステータスは変更されない', async () => {
    const transactionId = 'txn_20240115_001';
    const invoiceId = 'inv_20240115_001';
    const invoiceStatus_before = '支払い待ち';

    // PaymentGatewayAdapterのスタブ: 必須フィールド『status』が欠落した想定外の応答形式
    const mockPaymentGateway = {
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: transactionId,
        // statusフィールドが欠落（想定外）
        amount: '1000', // 文字列型で返却（想定外：数値型であるべき）
        timestamp: '2024-01-15T11:00:00Z'
      })
    };

    // getTransactionStatusを呼び出す
    const result = await getTransactionStatus(
      transactionId,
      invoiceId,
      mockPaymentGateway
    );

    // トランザクション履歴レコードが登録されたことを確認
    expect(result).toBeDefined();

    // ステータスが『エラー』『未処理』『スキップ』のいずれかであることを確認
    expect(['エラー', '未処理', 'スキップ']).toContain(result.transactionStatus);

    // 請求書ステータスが『支払い待ち』のままであることを確認（変更されないこと）
    expect(result.invoiceStatus).toBe(invoiceStatus_before);

    // エラーログが記録されたことを確認（『応答形式エラー』『パース失敗』など具体的なエラー内容）
    expect(result.errorLog).toMatch(/応答形式エラー|パース失敗/);
  });
});