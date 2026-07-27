import { searchCustomers } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-359
  test('顧客検索機能 - 顧客名のみで検索された場合、顧客IDは検索条件に含まれない', () => {
    const mockDatabaseQuery = jest.fn().mockResolvedValue([
      {
        customerId: 'CUST001',
        customerName: '山田商事',
        industry: '製造業',
        representative: '山田太郎',
      },
      {
        customerId: 'CUST002',
        customerName: '山田不動産',
        industry: '不動産',
        representative: '山田花子',
      },
    ]);

    const searchCondition = {
      customerName: '山田商事',
      customerId: undefined,
    };

    return searchCustomers(searchCondition, mockDatabaseQuery).then((results) => {
      expect(mockDatabaseQuery).toHaveBeenCalledTimes(1);

      const callArguments = mockDatabaseQuery.mock.calls[0][0];
      expect(callArguments).toHaveProperty('customerName', '山田商事');
      expect(callArguments).not.toHaveProperty('customerId');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      expect(results[0]).toEqual({
        customerId: 'CUST001',
        customerName: '山田商事',
        industry: '製造業',
        representative: '山田太郎',
      });
      expect(results[1]).toEqual({
        customerId: 'CUST002',
        customerName: '山田不動産',
        industry: '不動産',
        representative: '山田花子',
      });
    });
  });
});