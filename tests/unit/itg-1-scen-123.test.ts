import { extractMonthlyReportData } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-123
  test('月次報告期限・データ抽出処理 - 営業担当者IDが空の場合、エラーが発生する', () => {
    const emptySalesPersonId = '';
    const reportDeadline = new Date('2024-01-31T23:59:59Z');

    expect(() => {
      extractMonthlyReportData({
        salesPersonId: emptySalesPersonId,
        reportDeadline: reportDeadline,
      });
    }).toThrow(/営業担当者ID/);

    let thrownError: any;
    try {
      extractMonthlyReportData({
        salesPersonId: emptySalesPersonId,
        reportDeadline: reportDeadline,
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError.name).toBe('ValidationError');
    expect(thrownError.code).toBe('SALES_PERSON_ID_REQUIRED');
    expect(thrownError.message).toContain('営業担当者IDが指定されていません');
  });
});