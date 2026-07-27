import { fetchTimelineData } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  // SCEN-391
  test('商談と活動記録が0件のとき、空配列が返される', () => {
    const customerId = 'CUST-001';
    
    const deals = [];
    const activities = [];
    
    const result = fetchTimelineData(customerId, deals, activities);
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});