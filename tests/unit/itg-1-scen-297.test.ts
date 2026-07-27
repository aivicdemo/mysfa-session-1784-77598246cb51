import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { verifyDealInvoiceAlignment } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-297
  it('商談金額に端数が含まれる場合、請求金額との比較が正常に実行される', async () => {
    const dealRecord = {
      dealId: 'DEAL-001',
      dealAmount: 1234.56,
      dealStatus: '成約',
      customerId: 'CUST-001',
    };

    const invoiceRecord = {
      invoiceId: 'INV-001',
      invoiceAmount: 1234.56,
      invoiceStatus: '未支払い',
      invoiceDate: '2024-01-15',
      customerId: 'CUST-001',
    };

    const expectedResult = {
      alignmentStatus: '正常紐付け',
      dealAmount: '1,234.56円',
      invoiceAmount: '1,234.56円',
      amountDifference: '0.00円',
      comparisonStatus: '一致',
    };

    const result = await verifyDealInvoiceAlignment(dealRecord, invoiceRecord);

    expect(result.alignmentStatus).toBe(expectedResult.alignmentStatus);
    expect(result.dealAmount).toBe(expectedResult.dealAmount);
    expect(result.invoiceAmount).toBe(expectedResult.invoiceAmount);
    expect(result.amountDifference).toBe(expectedResult.amountDifference);
    expect(result.comparisonStatus).toBe(expectedResult.comparisonStatus);
  });
});