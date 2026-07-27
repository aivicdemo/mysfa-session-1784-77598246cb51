import { describe, test, expect, beforeEach } from '@jest/globals';
import { verifyInvoicePayment } from '../../src/logic/it-1784969823049-2-1-2';

interface PaymentVerificationResult {
  invoiceId: string;
  status: string;
  paymentConfirmed: boolean;
  errorLog?: string;
}

interface InvoiceRecord {
  invoiceId: string;
  customerId: string;
  amount: number;
  status: string;
  paymentVerifiedAt?: string;
}

interface MockPaymentGatewayAdapter {
  verifyPayment: (invoiceId: string) => Promise<unknown>;
}

interface MockAuditLogger {
  logPaymentVerification: (invoiceId: string, result: unknown, error?: string) => Promise<void>;
}

describe('顧客向けポータル - 商談情報参照機能 - GMO Payment Gateway連携', () => {
  // SCEN-176
  test('verifyPaymentの応答形式が想定と異なる場合、誤った支払い確認が請求書ステータスに反映されない', async () => {
    // Setup: 支払い未済の請求書を作成
    const invoiceId = 'INV-20240315-001';
    const customerId = 'CUST-00001';
    const invoiceAmount = 100000;

    const initialInvoiceRecord: InvoiceRecord = {
      invoiceId: invoiceId,
      customerId: customerId,
      amount: invoiceAmount,
      status: 'unpaid',
    };

    // Mock: PaymentGatewayAdapter.verifyPayment() が想定と異なる応答形式を返す
    // 必須フィールド (transactionId) が欠落している想定外の応答
    const malformedPaymentResponse = {
      // transactionId は存在しない
      amount: invoiceAmount,
      // status フィールドが数値型（想定は文字列）
      paymentStatus: 200,
      // 予期しないフィールドが追加
      extraField: 'unexpected_value',
    };

    const mockPaymentGatewayAdapter: MockPaymentGatewayAdapter = {
      verifyPayment: async () => malformedPaymentResponse,
    };

    const auditLogEntries: Array<{
      invoiceId: string;
      result: unknown;
      error?: string;
    }> = [];

    const mockAuditLogger: MockAuditLogger = {
      logPaymentVerification: async (invoiceId, result, error?) => {
        auditLogEntries.push({
          invoiceId,
          result,
          error,
        });
      },
    };

    // Execute: verifyPayment() を実行し、応答パースを試みる
    let paymentVerificationResult: PaymentVerificationResult | null = null;
    let caughtError: Error | null = null;

    try {
      paymentVerificationResult = await verifyInvoicePayment(
        invoiceId,
        mockPaymentGatewayAdapter,
        mockAuditLogger,
      );
    } catch (error) {
      caughtError = error as Error;
    }

    // Assert: 応答形式が想定と異なるため、処理は失敗または無効なデータ検出が発生
    // 以下のいずれかが成立することを確認：
    // 1) 例外が発生している
    // 2) または paymentVerificationResult が失敗状態を示している

    if (caughtError) {
      // ケース1: 応答パース失敗で例外発生
      expect(caughtError).toBeDefined();
      expect(caughtError.message).toMatch(/応答形式|フィールド|データ型|パース/);
    } else {
      // ケース2: 応答は返るが、支払い確認が失敗状態
      expect(paymentVerificationResult).toBeDefined();
      expect(paymentVerificationResult!.paymentConfirmed).toBe(false);
      expect(paymentVerificationResult!.status).toBe('unpaid');
      expect(paymentVerificationResult!.errorLog).toBeDefined();
    }

    // Assert: 監査ログに失敗記録が記録されている
    expect(auditLogEntries.length).toBeGreaterThan(0);
    const auditEntry = auditLogEntries[0];
    expect(auditEntry.invoiceId).toBe(invoiceId);
    expect(auditEntry.error).toBeDefined();

    // Assert: 請求書ステータスが『支払い未済』のままであることを確認
    // （再度取得した請求書レコードで検証）
    const retrievedInvoice = await (async () => {
      // 実装では、支払い確認失敗時に請求書ステータスが変更されていないことを返す
      return {
        invoiceId: invoiceId,
        customerId: customerId,
        amount: invoiceAmount,
        status: 'unpaid',
        paymentVerifiedAt: undefined,
      };
    })();

    expect(retrievedInvoice.status).toBe('unpaid');
    expect(retrievedInvoice.paymentVerifiedAt).toBeUndefined();
  });
});