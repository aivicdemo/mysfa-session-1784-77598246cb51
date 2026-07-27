import { generatePaymentLink } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-168
  test('[normal] GMO Payment Gateway連携 - generatePaymentLinkが成功応答を返した場合、請求書に対応した支払いリンクが生成される', async () => {
    // テスト用請求書データ
    const invoice_id = 'INV-20240115-001';
    const invoice_amount = 150000;
    const invoice_customer_id = 'CUST-12345';
    const invoice_number = 'INV-2024-001';
    const invoice_due_date = '2024-02-15';
    const invoice_created_at = new Date('2024-01-15T10:00:00Z');

    // PaymentGatewayAdapterのスタブ（成功応答）
    const assumed_payment_link_url = 'https://payment.example.com/pay/txn_abc123def456';
    const assumed_transaction_id = 'txn_abc123def456';
    const assumed_generation_timestamp = new Date('2024-01-15T11:00:00Z');
    const assumed_expiration_timestamp = new Date('2024-02-15T11:00:00Z');

    const payment_gateway_adapter_stub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        payment_link_url: assumed_payment_link_url,
        transaction_id: assumed_transaction_id,
        generated_at: assumed_generation_timestamp.toISOString(),
        expires_at: assumed_expiration_timestamp.toISOString(),
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    // テスト対象関数を呼び出し
    const result = await generatePaymentLink(
      {
        invoice_id,
        invoice_amount,
        invoice_customer_id,
        invoice_number,
        invoice_due_date,
        invoice_created_at,
      },
      payment_gateway_adapter_stub
    );

    // 期待結果の検証
    // (1) generatePaymentLinkメソッドが正しい引数で呼び出されたことを確認
    expect(payment_gateway_adapter_stub.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_id,
        invoice_amount,
        invoice_customer_id,
      })
    );

    // (2) 支払いリンク情報がデータベースに正確に保存されていることを確認
    expect(result).toEqual(
      expect.objectContaining({
        invoice_id,
        payment_link_url: assumed_payment_link_url,
        transaction_id: assumed_transaction_id,
        generated_at: assumed_generation_timestamp.toISOString(),
        expires_at: assumed_expiration_timestamp.toISOString(),
        status: '支払いリンク生成済み',
      })
    );

    // (3) 請求書ステータスが『支払いリンク生成済み』に更新されていることを確認
    expect(result.status).toBe('支払いリンク生成済み');

    // (4) 支払いリンクURLが正確に保存されていることを確認
    expect(result.payment_link_url).toBe(assumed_payment_link_url);

    // (5) トランザクションIDが正確に保存されていることを確認
    expect(result.transaction_id).toBe(assumed_transaction_id);

    // (6) 生成日時が正確に保存されていることを確認
    expect(result.generated_at).toBe(assumed_generation_timestamp.toISOString());

    // (7) 有効期限が正確に保存されていることを確認
    expect(result.expires_at).toBe(assumed_expiration_timestamp.toISOString());

    // (8) エラーメッセージが含まれていないことを確認
    expect(result.error_message).toBeUndefined();
  });
});