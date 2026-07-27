import { describe, test, expect } from '@jest/globals';
import { reconcileSalesAndBillingData } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求データ照合機能', () => {
  // SCEN-939
  test('[error] 売上計上予定日が空文字列の場合、照合不可エラーが返される', () => {
    const salesRecord = {
      id: 'SALES_001',
      amount: 100000,
      recordedDatePlanned: '',
      customerId: 'CUST_001',
      dealId: 'DEAL_001',
    };

    const billingRecord = {
      id: 'INVOICE_001',
      amount: 100000,
      invoiceDate: '2024-04-15',
      invoiceDueDate: '2024-05-15',
      customerId: 'CUST_001',
      dealId: 'DEAL_001',
    };

    const result = reconcileSalesAndBillingData(salesRecord, billingRecord);

    expect(result).toEqual({
      isSuccess: false,
      error: {
        code: 'RECONCILIATION_ERROR',
        message: '売上計上予定日が未設定です。照合を継続できません',
        field: 'revenue.recordedDatePlanned',
        errorType: 'VALIDATION_FAILED',
      },
    });
  });
});