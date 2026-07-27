import { describe, test, expect, beforeEach } from '@jest/globals';
import { filterByType } from '../../src/logic/it-1';

describe('Activity Record Filtering - Email Type Filter', () => {
  // SCEN-414
  test('should filter activity records to return only email type records from mixed dataset', () => {
    const activities = [
      {
        id: 'act_001',
        type: 'email',
        createdAt: new Date('2024-01-15T09:00:00Z'),
        description: 'Customer inquiry email received'
      },
      {
        id: 'act_002',
        type: 'call',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        description: 'Phone call with customer'
      },
      {
        id: 'act_003',
        type: 'email',
        createdAt: new Date('2024-01-15T11:00:00Z'),
        description: 'Follow-up email sent'
      },
      {
        id: 'act_004',
        type: 'visit',
        createdAt: new Date('2024-01-15T14:00:00Z'),
        description: 'In-person customer visit'
      },
      {
        id: 'act_005',
        type: 'call',
        createdAt: new Date('2024-01-15T15:30:00Z'),
        description: 'Confirmation call'
      },
      {
        id: 'act_006',
        type: 'email',
        createdAt: new Date('2024-01-15T16:00:00Z'),
        description: 'Quote sent via email'
      }
    ];

    const filtered_result = filterByType(activities, 'email');

    expect(Array.isArray(filtered_result)).toBe(true);
    expect(filtered_result.length).toBe(3);
    expect(filtered_result.every((record) => record.type === 'email')).toBe(true);
    expect(filtered_result.map((record) => record.id)).toEqual([
      'act_001',
      'act_003',
      'act_006'
    ]);
  });
});