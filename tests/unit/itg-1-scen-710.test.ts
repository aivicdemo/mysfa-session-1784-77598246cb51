import { calculateBusinessDaysBefore } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-710: 営業日計算ロジック - 月次決算期限から1営業日前を算出する場合、土日祝日を正しくスキップして計算される', () => {
    // テスト用の祝日マスタデータ（2024年の一般的な日本の祝日）
    const holidaysInJapan2024 = [
      new Date('2024-01-01'), // 元日（月）
      new Date('2024-01-08'), // 成人の日（月）
      new Date('2024-02-11'), // 建国記念の日（日）
      new Date('2024-02-12'), // 振替休日（月）
      new Date('2024-03-20'), // 春分の日（水）
      new Date('2024-04-29'), // 昭和の日（月）
      new Date('2024-05-03'), // 憲法記念日（金）
      new Date('2024-05-04'), // みどりの日（土）
      new Date('2024-05-05'), // こどもの日（日）
      new Date('2024-05-06'), // 振替休日（月）
      new Date('2024-07-15'), // 海の日（月）
      new Date('2024-08-11'), // 山の日（日）
      new Date('2024-08-12'), // 振替休日（月）
      new Date('2024-09-16'), // 敬老の日（月）
      new Date('2024-09-22'), // 秋分の日（日）
      new Date('2024-09-23'), // 振替休日（月）
      new Date('2024-10-14'), // スポーツの日（月）
      new Date('2024-11-03'), // 文化の日（日）
      new Date('2024-11-04'), // 振替休日（月）
      new Date('2024-11-23'), // 勤労感謝の日（土）
    ];

    // テストケース1: 決算期限が2024年1月31日（水曜日）の場合
    const deadline1 = new Date('2024-01-31T00:00:00Z');
    const result1 = calculateBusinessDaysBefore(deadline1, 1, holidaysInJapan2024);
    const expected1 = new Date('2024-01-30T00:00:00Z'); // 火曜日
    expect(result1.toISOString().split('T')[0]).toBe(expected1.toISOString().split('T')[0]);

    // テストケース2: 決算期限が2024年2月1日（木曜日）の場合
    const deadline2 = new Date('2024-02-01T00:00:00Z');
    const result2 = calculateBusinessDaysBefore(deadline2, 1, holidaysInJapan2024);
    const expected2 = new Date('2024-01-31T00:00:00Z'); // 水曜日
    expect(result2.toISOString().split('T')[0]).toBe(expected2.toISOString().split('T')[0]);

    // テストケース3: 決算期限が2024年2月5日（月曜日）の場合、1営業日前は2024年2月2日（金曜日）ではなく、土日をスキップして2024年2月1日（木曜日）
    const deadline3 = new Date('2024-02-05T00:00:00Z');
    const result3 = calculateBusinessDaysBefore(deadline3, 1, holidaysInJapan2024);
    const expected3 = new Date('2024-02-02T00:00:00Z'); // 金曜日
    expect(result3.toISOString().split('T')[0]).toBe(expected3.toISOString().split('T')[0]);

    // テストケース4: 決算期限が祝日直後の営業日である場合（2024年1月9日（火曜日、成人の日の翌日））
    const deadline4 = new Date('2024-01-09T00:00:00Z');
    const result4 = calculateBusinessDaysBefore(deadline4, 1, holidaysInJapan2024);
    const expected4 = new Date('2024-01-05T00:00:00Z'); // 金曜日（1月8日は成人の日で祝日）
    expect(result4.toISOString().split('T')[0]).toBe(expected4.toISOString().split('T')[0]);
  });
});