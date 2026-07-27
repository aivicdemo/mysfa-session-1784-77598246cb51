import { getTimelineSortedRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  test('SCEN-393: 商談と活動記録が複数件のとき、すべてが最新順（降順）にソートされる', () => {
    const deals = [
      {
        id: 'deal-001',
        customerId: 'customer-001',
        createdAt: new Date('2024-01-10T09:00:00Z'),
        type: 'deal',
        title: 'Deal 1',
      },
      {
        id: 'deal-002',
        customerId: 'customer-001',
        createdAt: new Date('2024-01-15T14:30:00Z'),
        type: 'deal',
        title: 'Deal 2',
      },
      {
        id: 'deal-003',
        customerId: 'customer-001',
        createdAt: new Date('2024-01-12T11:15:00Z'),
        type: 'deal',
        title: 'Deal 3',
      },
    ];

    const activities = [
      {
        id: 'activity-001',
        customerId: 'customer-001',
        recordedAt: new Date('2024-01-09T16:45:00Z'),
        type: 'activity',
        description: 'Activity 1',
      },
      {
        id: 'activity-002',
        customerId: 'customer-001',
        recordedAt: new Date('2024-01-16T10:20:00Z'),
        type: 'activity',
        description: 'Activity 2',
      },
      {
        id: 'activity-003',
        customerId: 'customer-001',
        recordedAt: new Date('2024-01-13T13:50:00Z'),
        type: 'activity',
        description: 'Activity 3',
      },
    ];

    const result = getTimelineSortedRecords(deals, activities);

    expect(result).toEqual([
      {
        id: 'activity-002',
        customerId: 'customer-001',
        recordedAt: new Date('2024-01-16T10:20:00Z'),
        type: 'activity',
        description: 'Activity 2',
      },
      {
        id: 'deal-002',
        customerId: 'customer-001',
        createdAt: new Date('2024-01-15T14:30:00Z'),
        type: 'deal',
        title: 'Deal 2',
      },
      {
        id: 'activity-003',
        customerId: 'customer-001',
        recordedAt: new Date('2024-01-13T13:50:00Z'),
        type: 'activity',
        description: 'Activity 3',
      },
      {
        id: 'deal-003',
        customerId: 'customer-001',
        createdAt: new Date('2024-01-12T11:15:00Z'),
        type: 'deal',
        title: 'Deal 3',
      },
      {
        id: 'deal-001',
        customerId: 'customer-001',
        createdAt: new Date('2024-01-10T09:00:00Z'),
        type: 'deal',
        title: 'Deal 1',
      },
      {
        id: 'activity-001',
        customerId: 'customer-001',
        recordedAt: new Date('2024-01-09T16:45:00Z'),
        type: 'activity',
        description: 'Activity 1',
      },
    ]);
  });
});