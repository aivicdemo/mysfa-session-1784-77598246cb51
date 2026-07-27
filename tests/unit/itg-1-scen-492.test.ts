import { searchCustomersByLoginUser } from '../../src/logic/it-1';

describe('顧客レコード検索・権限制御機能', () => {
  // SCEN-492
  test('複数の営業が同じ顧客に割り当てられているとき、ログイン中の営業だけに限定して表示される', () => {
    const customerId = 'CUST-001';
    const customerName = '山田商事';
    const salesAUserId = 'SALES-001';
    const salesBUserId = 'SALES-002';

    const customerRecord = {
      customerId: customerId,
      customerName: customerName,
      assignedSalesUsers: [
        { userId: salesAUserId, userName: '営業A' },
        { userId: salesBUserId, userName: '営業B' },
      ],
    };

    // 営業Aでのログイン・検索
    const resultForSalesA = searchCustomersByLoginUser(
      customerName,
      salesAUserId,
      [customerRecord]
    );

    expect(resultForSalesA).toHaveLength(1);
    expect(resultForSalesA[0].customerId).toBe(customerId);
    expect(resultForSalesA[0].customerName).toBe(customerName);
    expect(resultForSalesA[0].assignedSalesUsers).toHaveLength(1);
    expect(resultForSalesA[0].assignedSalesUsers[0].userId).toBe(
      salesAUserId
    );
    expect(resultForSalesA[0].assignedSalesUsers[0].userName).toBe('営業A');

    // 営業Bでのログイン・検索
    const resultForSalesB = searchCustomersByLoginUser(
      customerName,
      salesBUserId,
      [customerRecord]
    );

    expect(resultForSalesB).toHaveLength(1);
    expect(resultForSalesB[0].customerId).toBe(customerId);
    expect(resultForSalesB[0].customerName).toBe(customerName);
    expect(resultForSalesB[0].assignedSalesUsers).toHaveLength(1);
    expect(resultForSalesB[0].assignedSalesUsers[0].userId).toBe(
      salesBUserId
    );
    expect(resultForSalesB[0].assignedSalesUsers[0].userName).toBe('営業B');

    // 営業Aと営業Bの検索結果が異なること
    expect(resultForSalesA[0].assignedSalesUsers[0].userId).not.toBe(
      resultForSalesB[0].assignedSalesUsers[0].userId
    );
  });
});