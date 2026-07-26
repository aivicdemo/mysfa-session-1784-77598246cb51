import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  validateInvoiceAgainstCustomerInfo,
} from '../../src/logic/it-1784969823049-2-1-2';

const fetchMock = require('jest-fetch-mock');

describe('顧客向けポータル - 請求書検証・承認機能', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  test('SCEN-098: 請求書の金額が顧客情報と不一致の場合、差戻し指示が自動実行される', async () => {
    // ========== 前提条件 ==========
    // 顧客情報の契約金額は 500,000 円、割引率は 5%、税率は 10%
    // 請求書の金額は 600,000 円（不一致）
    const customerId = 'CUST-001';
    const contractAmount = 500000;
    const discountRate = 0.05;
    const taxRate = 0.1;
    const invoiceId = 'INV-2024-001';
    const invoiceAmount = 600000;

    // 期待される計算結果：
    // 正規金額 = 500000 * (1 - 0.05) * (1 + 0.1) = 500000 * 0.95 * 1.1 = 522,500 円
    // 請求書金額 = 600,000 円
    // 差異 = 600000 - 522500 = 77,500 円（許容範囲外：通常は 1% 以内 5,225 円が許容）
    const expectedCorrectAmount = 522500;
    const amountDifference = invoiceAmount - expectedCorrectAmount;
    const toleranceAmount = expectedCorrectAmount * 0.01; // 1% = 5,225 円

    const customerData = {
      customerId,
      contractAmount,
      discountRate,
      taxRate,
    };

    const invoiceData = {
      invoiceId,
      customerId,
      amount: invoiceAmount,
      lineItems: [
        {
          description: 'Service A',
          quantity: 1,
          unitPrice: 600000,
        },
      ],
      issuedDate: '2024-01-15T09:00:00Z',
    };

    const validationRequest = {
      invoiceId,
      customerId,
      invoiceAmount,
      expectedAmount: expectedCorrectAmount,
      tolerance: toleranceAmount,
    };

    // ========== 検証ロジック呼び出し ==========
    // validateInvoiceAgainstCustomerInfo は以下を実行：
    // 1. 顧客情報から正規金額を計算
    // 2. 請求書金額と正規金額の差異を確認
    // 3. 差異が許容範囲外の場合、差戻し指示を実行
    // 4. 差戻し結果（status: 'RETURNED'、reason: 'AMOUNT_MISMATCH'）を返す
    fetchMock.mockResponseOnce(
      JSON.stringify({
        customerId,
        contractAmount,
        discountRate,
        taxRate,
      }),
      { status: 200 }
    );

    const result = await validateInvoiceAgainstCustomerInfo(validationRequest);

    // ========== 期待結果の検証 ==========
    // 1. 検証処理が実行され、差異が許容範囲外と判定される
    expect(result).toBeDefined();
    expect(result.invoiceId).toBe(invoiceId);
    expect(result.customerId).toBe(customerId);
    expect(result.calculatedAmount).toBe(expectedCorrectAmount);
    expect(result.reportedAmount).toBe(invoiceAmount);
    expect(result.amountDifference).toBe(amountDifference);

    // 2. 差異が許容範囲を超過している
    expect(amountDifference > toleranceAmount).toBe(true);

    // 3. 差戻し指示が自動実行され、ステータスが『差戻し待機中』に更新される
    expect(result.validationStatus).toBe('RETURNED');
    expect(result.invoiceStatus).toBe('AWAITING_RESUBMISSION');

    // 4. 差戻し理由が『金額不一致』で記録される
    expect(result.returnReason).toBe('AMOUNT_MISMATCH');
    expect(result.returnReasonDetail).toContain('金額不一致');

    // 5. 差戻し通知が顧客に送信されたことが確認される
    expect(result.notificationSent).toBe(true);
    expect(result.notificationType).toBe('INVOICE_RETURNED');
    expect(result.notificationMessage).toContain('請求書が返送されました');
    expect(result.notificationMessage).toContain('金額不一致');

    // 6. 差戻し実行の履歴がログに記録される
    expect(result.auditLog).toBeDefined();
    expect(result.auditLog.length).toBeGreaterThan(0);
    expect(result.auditLog[result.auditLog.length - 1].action).toBe(
      'INVOICE_RETURNED'
    );
    expect(result.auditLog[result.auditLog.length - 1].reason).toBe(
      'AMOUNT_MISMATCH'
    );
    expect(result.auditLog[result.auditLog.length - 1].timestamp).toBeDefined();

    // 7. 金額不一致の詳細情報が検証結果に含まれる
    expect(result.discrepancyDetails).toBeDefined();
    expect(result.discrepancyDetails.expectedAmount).toBe(expectedCorrectAmount);
    expect(result.discrepancyDetails.actualAmount).toBe(invoiceAmount);
    expect(result.discrepancyDetails.difference).toBe(amountDifference);
    expect(result.discrepancyDetails.toleranceLimit).toBe(toleranceAmount);
    expect(result.discrepancyDetails.isWithinTolerance).toBe(false);

    // 8. API 呼び出しの検証
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/customers/');
  });
});