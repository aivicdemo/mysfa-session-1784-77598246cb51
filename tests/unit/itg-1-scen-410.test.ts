import { filterActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録表示機能', () => {
  test('SCEN-410: 活動記録フィルタリング機能 - フィルタ適用時に指定タイプと一致する1件が返される', () => {
    // Arrange
    const salesPersonId = 'SP-001';
    const customerId = 'CUST001';
    const activityType = 'phone';
    const activityDateTime = '2024-01-15T14:30:00Z';

    const inputActivityRecords = [
      {
        activityId: 'ACT-001',
        activityType: 'phone',
        salesPersonId: salesPersonId,
        customerId: customerId,
        activityDateTime: activityDateTime,
        description: 'Customer consultation call',
        createdAt: '2024-01-15T14:30:00Z'
      }
    ];

    const filterCondition = {
      activityType: activityType,
      salesPersonId: salesPersonId
    };

    // Act
    const result = filterActivityRecords(inputActivityRecords, filterCondition);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      activityId: 'ACT-001',
      activityType: 'phone',
      salesPersonId: salesPersonId,
      customerId: customerId,
      activityDateTime: activityDateTime,
      description: 'Customer consultation call',
      createdAt: '2024-01-15T14:30:00Z'
    });
    expect(result[0].activityType).toBe('phone');
    expect(result[0].salesPersonId).toBe(salesPersonId);
    expect(result[0].customerId).toBe('CUST001');
  });
});