import { calculateBusinessDaysFromDeadline } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-712
  test('月次決算期限が土曜日の場合、営業日計算は金曜日から数える', () => {
    const saturdayDeadline = new Date('2024-01-06T00:00:00Z');
    const expectedBusinessDayStart = new Date('2024-01-05T00:00:00Z');
    
    const result = calculateBusinessDaysFromDeadline(saturdayDeadline);
    
    expect(result.businessDayStart).toEqual(expectedBusinessDayStart);
    expect(result.businessDayStart.getDay()).toBe(5);
    expect(saturdayDeadline.getDay()).toBe(6);
  });
});