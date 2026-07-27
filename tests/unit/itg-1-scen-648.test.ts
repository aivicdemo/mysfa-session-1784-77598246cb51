import { detectSalesAndInvoiceDiscrepancy } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-648
  test('売上実績と請求書のズレ解消機能 - 売上実績の金額が請求書の金額より1000円少ないとき、1000円のズレと検出される', () => {
    const salesRecordAmount = 99000;
    const invoiceAmount = 100000;
    const expectedDiscrepancy = 1000;
    const expectedDirection = '売上実績が請求書より少ない';
    const expectedCategoryReason = '金額差分';

    const result = detectSalesAndInvoiceDiscrepancy({
      salesAmount: salesRecordAmount,
      invoiceAmount: invoiceAmount,
    });

    expect(result.discrepancyAmount).toBe(expectedDiscrepancy);
    expect(result.discrepancyDirection).toBe(expectedDirection);
    expect(result.categoryReason).toBe(expectedCategoryReason);
    expect(result.isRecorded).toBe(true);
    expect(result.linkedSalesAmount).toBe(salesRecordAmount);
    expect(result.linkedInvoiceAmount).toBe(invoiceAmount);
  });
});