import { searchCustomersByName } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-352
  test('顧客名で部分一致する顧客レコードが複数件抽出される', () => {
    // Arrange
    const mockCustomerDatabase = [
      {
        customerId: 'CUST001',
        customerName: '株式会社山田商事',
        address: '東京都渋谷区道玄坂1-1-1',
        salesRepresentative: '営業太郎'
      },
      {
        customerId: 'CUST002',
        customerName: '山田物産株式会社',
        address: '大阪府大阪市北区中之島1-1-1',
        salesRepresentative: '営業次郎'
      },
      {
        customerId: 'CUST003',
        customerName: '山田エンジニアリング',
        address: '名古屋市中区栄1-1-1',
        salesRepresentative: '営業三郎'
      },
      {
        customerId: 'CUST004',
        customerName: '鈴木工業',
        address: '福岡県福岡市中央区天神1-1-1',
        salesRepresentative: '営業四郎'
      }
    ];

    const searchKeyword = '山田';

    // Act
    const result = searchCustomersByName(searchKeyword, mockCustomerDatabase);

    // Assert
    expect(result.totalCount).toBe(3);
    expect(result.displayRange).toBe('3件中1～3件を表示');
    expect(result.customers).toHaveLength(3);
    
    expect(result.customers[0]).toEqual({
      customerId: 'CUST001',
      customerName: '株式会社山田商事',
      address: '東京都渋谷区道玄坂1-1-1',
      salesRepresentative: '営業太郎'
    });
    
    expect(result.customers[1]).toEqual({
      customerId: 'CUST002',
      customerName: '山田物産株式会社',
      address: '大阪府大阪市北区中之島1-1-1',
      salesRepresentative: '営業次郎'
    });
    
    expect(result.customers[2]).toEqual({
      customerId: 'CUST003',
      customerName: '山田エンジニアリング',
      address: '名古屋市中区栄1-1-1',
      salesRepresentative: '営業三郎'
    });

    const customerNames = result.customers.map(c => c.customerName);
    expect(customerNames).not.toContain('鈴木工業');
  });
});