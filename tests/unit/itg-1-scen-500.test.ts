import { searchCustomerRecords } from '../../src/logic/it-1';

describe('顧客レコード検索・権限制御機能', () => {
  test('SCEN-500: 同じ検索キーワードで2回実行したとき、同じ結果が返される', () => {
    const searchKeyword = '田中商事';
    const testUserId = 'user-001';

    const firstSearchResult = searchCustomerRecords({
      keyword: searchKeyword,
      userId: testUserId,
    });

    const secondSearchResult = searchCustomerRecords({
      keyword: searchKeyword,
      userId: testUserId,
    });

    expect(firstSearchResult.records.length).toBe(secondSearchResult.records.length);

    expect(firstSearchResult.records).toEqual(secondSearchResult.records);

    for (let i = 0; i < firstSearchResult.records.length; i++) {
      const firstRecord = firstSearchResult.records[i];
      const secondRecord = secondSearchResult.records[i];

      expect(firstRecord.customerId).toBe(secondRecord.customerId);
      expect(firstRecord.customerName).toBe(secondRecord.customerName);
      expect(firstRecord.address).toBe(secondRecord.address);
      expect(firstRecord.phoneNumber).toBe(secondRecord.phoneNumber);
      expect(firstRecord.emailAddress).toBe(secondRecord.emailAddress);
      expect(firstRecord.createdAt).toBe(secondRecord.createdAt);
    }

    expect(JSON.stringify(firstSearchResult)).toBe(JSON.stringify(secondSearchResult));
  });
});