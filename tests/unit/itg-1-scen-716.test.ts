import { calculateBusinessDays } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-716
  test('祝日マスタが存在しない場合、営業日計算は失敗する', () => {
    const baseDateStr = '2024-01-15';
    const businessDaysToAdd = 10;
    const emptyHolidayMaster: Array<{ date: string }> = [];

    expect(() => {
      calculateBusinessDays(baseDateStr, businessDaysToAdd, emptyHolidayMaster);
    }).toThrow(/祝日マスタ/);
  });
});