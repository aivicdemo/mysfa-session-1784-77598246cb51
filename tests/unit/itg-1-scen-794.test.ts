import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-794
  test('請求対象データ抽出機能 - 同じ抽出条件で2回実行したとき、同じ結果が返される', () => {
    const extractionCondition = {
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-31T23:59:59Z'),
      customerType: 'corporate',
      billingStatus: 'unpaid',
    };

    const firstExtractionResult = extractBillingTargetData(extractionCondition);
    const firstExtractionRecordCount = firstExtractionResult.records.length;
    const firstExtractionTimestamp = firstExtractionResult.executedAt;

    const secondExtractionResult = extractBillingTargetData(extractionCondition);
    const secondExtractionRecordCount = secondExtractionResult.records.length;
    const secondExtractionTimestamp = secondExtractionResult.executedAt;

    expect(secondExtractionRecordCount).toBe(firstExtractionRecordCount);

    for (let i = 0; i < firstExtractionResult.records.length; i++) {
      expect(secondExtractionResult.records[i].customerId).toBe(
        firstExtractionResult.records[i].customerId
      );
      expect(secondExtractionResult.records[i].invoiceAmount).toBe(
        firstExtractionResult.records[i].invoiceAmount
      );
      expect(secondExtractionResult.records[i].billingTargetStartDate).toBe(
        firstExtractionResult.records[i].billingTargetStartDate
      );
      expect(secondExtractionResult.records[i].billingTargetEndDate).toBe(
        firstExtractionResult.records[i].billingTargetEndDate
      );
      expect(secondExtractionResult.records[i].dealId).toBe(
        firstExtractionResult.records[i].dealId
      );
      expect(secondExtractionResult.records[i].dealStatus).toBe(
        firstExtractionResult.records[i].dealStatus
      );
    }

    expect(firstExtractionTimestamp).not.toBe(secondExtractionTimestamp);
  });
});