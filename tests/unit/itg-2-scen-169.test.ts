import { verifyPaymentAndUpdateInvoiceStatus } from '../../src/logic/it-1784969823049-2-1-2';

const PaymentGatewayAdapter = jest.fn();
const AuditLogExporter = jest.fn();

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-169
  test('[normal] GMO Payment Gateway連携 - verifyPaymentが成功応答を返した場合、支払い完了が確認され請求書ステータスが更新される', async () => {
    // テスト用の請求書データを作成し、ステータスを「支払い待機中」に設定
    const invoiceId = 'INV-2024-001';
    const invoiceData = {
      id: invoiceId,
      customerId: 'CUST-001',
      amount: 150000,
      status: '支払い待機中',
      createdAt: '2024-01-15T09:00:00Z',
      dueDate: '2024-02-15T23:59:59Z',
    };

    const transactionId = 'TXN-GMO-20240115-001';
    const paymentVerificationParams = {
      invoiceId: invoiceId,
      transactionId: transactionId,
      amountVerified: 150000,
      paymentMethod: 'card',
    };

    // PaymentGatewayAdapterのverifyPaymentメソッドをスタブ化し、成功応答を返す
    const verifyPaymentStub = jest.fn().mockResolvedValue({
      success: true,
      transactionId: transactionId,
      verifiedAmount: 150000,
      paymentConfirmedAt: '2024-01-15T10:30:00Z',
      status: 'confirmed',
    });

    const paymentGatewayAdapterMock = {
      verifyPayment: verifyPaymentStub,
    };

    // AuditLogExporterのlogDataAccessメソッドをスタブ化
    const logDataAccessStub = jest.fn().mockResolvedValue({
      success: true,
      logId: 'LOG-20240115-001',
    });

    const auditLogExporterMock = {
      logDataAccess: logDataAccessStub,
    };

    // verifyPaymentメソッドを呼び出し、対象の請求書IDと支払い検証用パラメータを渡す
    const result = await verifyPaymentAndUpdateInvoiceStatus(
      invoiceData,
      paymentVerificationParams,
      paymentGatewayAdapterMock,
      auditLogExporterMock
    );

    // メソッドの戻り値が成功ステータスであることを確認
    expect(result.success).toBe(true);
    expect(result.status).toBe('支払い完了');

    // 請求書のステータスが「支払い完了」に更新されたことを確認
    expect(result.invoiceStatus).toBe('支払い完了');

    // トランザクションIDと支払い確認日時がシステムに記録されていることを確認
    expect(result.transactionId).toBe(transactionId);
    expect(result.paymentConfirmedAt).toBe('2024-01-15T10:30:00Z');

    // PaymentGatewayAdapterのverifyPaymentメソッドが呼び出されたことを確認
    expect(verifyPaymentStub).toHaveBeenCalledWith(paymentVerificationParams);
    expect(verifyPaymentStub).toHaveBeenCalledTimes(1);

    // AuditLogExporterのlogDataAccessメソッドが呼び出されたことを確認
    expect(logDataAccessStub).toHaveBeenCalled();
    expect(logDataAccessStub).toHaveBeenCalledTimes(1);

    // 監査ログの呼び出し引数に請求書ID、ユーザーアクション、タイムスタンプが含まれることを確認
    const auditLogCall = logDataAccessStub.mock.calls[0][0];
    expect(auditLogCall.invoiceId).toBe(invoiceId);
    expect(auditLogCall.action).toMatch(/支払い完了/);
    expect(auditLogCall.timestamp).toBeDefined();
  });
});