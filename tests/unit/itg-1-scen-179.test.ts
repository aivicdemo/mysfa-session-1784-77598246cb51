import { searchCustomerRecords } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-179
  test('顧客IDで部分一致する複数の顧客レコードが一覧表示される', () => {
    const searchInput = 'CUST-01';
    
    const mockCustomerDatabase = [
      {
        customerId: 'CUST-010',
        customerName: '株式会社ABC',
        contactInfo: '03-xxxx-0001',
        dealHistory: [],
        activityRecords: [],
        issueResolutions: []
      },
      {
        customerId: 'CUST-011',
        customerName: '株式会社DEF',
        contactInfo: '03-xxxx-0002',
        dealHistory: [],
        activityRecords: [],
        issueResolutions: []
      },
      {
        customerId: 'CUST-012',
        customerName: '株式会社GHI',
        contactInfo: '03-xxxx-0003',
        dealHistory: [],
        activityRecords: [],
        issueResolutions: []
      },
      {
        customerId: 'CUST-020',
        customerName: '株式会社JKL',
        contactInfo: '03-xxxx-0004',
        dealHistory: [],
        activityRecords: [],
        issueResolutions: []
      }
    ];

    const result = searchCustomerRecords(searchInput, mockCustomerDatabase);

    expect(result).toEqual([
      {
        customerId: 'CUST-010',
        customerName: '株式会社ABC',
        contactInfo: '03-xxxx-0001',
        dealHistory: [],
        activityRecords: [],
        issueResolutions: []
      },
      {
        customerId: 'CUST-011',
        customerName: '株式会社DEF',
        contactInfo: '03-xxxx-0002',
        dealHistory: [],
        activityRecords: [],
        issueResolutions: []
      },
      {
        customerId: 'CUST-012',
        customerName: '株式会社GHI',
        contactInfo: '03-xxxx-0003',
        dealHistory: [],
        activityRecords: [],
        issueResolutions: []
      }
    ]);

    expect(result.length).toBe(3);
    expect(result[0].customerId).toBe('CUST-010');
    expect(result[1].customerId).toBe('CUST-011');
    expect(result[2].customerId).toBe('CUST-012');
    expect(result.every(record => record.customerId.startsWith(searchInput))).toBe(true);
  });
});