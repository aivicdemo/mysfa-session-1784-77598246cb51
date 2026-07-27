import { searchCustomers } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-361
  test('部分一致検索で大文字小文字を区別しない結果が返される', () => {
    const mockCustomerData = [
      {
        customerId: 'C001',
        customerName: '太郎商事',
        industry: '製造業',
        region: '東京'
      },
      {
        customerId: 'C002',
        customerName: '太郎工業',
        industry: '建設業',
        region: '神奈川'
      },
      {
        customerId: 'C003',
        customerName: 'ABC商社',
        industry: '商社',
        region: '大阪'
      },
      {
        customerId: 'C004',
        customerName: '太郎製作所',
        industry: '製造業',
        region: '埼玉'
      }
    ];

    const searchKeywordUppercase = 'TARO';
    const resultUppercase = searchCustomers(searchKeywordUppercase, mockCustomerData);

    const searchKeywordLowercase = 'taro';
    const resultLowercase = searchCustomers(searchKeywordLowercase, mockCustomerData);

    const searchKeywordMixedCase = 'TaRo';
    const resultMixedCase = searchCustomers(searchKeywordMixedCase, mockCustomerData);

    const expectedCustomerIds = ['C001', 'C002', 'C004'];
    const expectedCustomerNames = ['太郎商事', '太郎工業', '太郎製作所'];

    expect(resultUppercase).toEqual([
      {
        customerId: 'C001',
        customerName: '太郎商事',
        industry: '製造業',
        region: '東京'
      },
      {
        customerId: 'C002',
        customerName: '太郎工業',
        industry: '建設業',
        region: '神奈川'
      },
      {
        customerId: 'C004',
        customerName: '太郎製作所',
        industry: '製造業',
        region: '埼玉'
      }
    ]);

    expect(resultLowercase).toEqual([
      {
        customerId: 'C001',
        customerName: '太郎商事',
        industry: '製造業',
        region: '東京'
      },
      {
        customerId: 'C002',
        customerName: '太郎工業',
        industry: '建設業',
        region: '神奈川'
      },
      {
        customerId: 'C004',
        customerName: '太郎製作所',
        industry: '製造業',
        region: '埼玉'
      }
    ]);

    expect(resultMixedCase).toEqual([
      {
        customerId: 'C001',
        customerName: '太郎商事',
        industry: '製造業',
        region: '東京'
      },
      {
        customerId: 'C002',
        customerName: '太郎工業',
        industry: '建設業',
        region: '神奈川'
      },
      {
        customerId: 'C004',
        customerName: '太郎製作所',
        industry: '製造業',
        region: '埼玉'
      }
    ]);

    expect(resultUppercase.length).toBe(3);
    expect(resultLowercase.length).toBe(3);
    expect(resultMixedCase.length).toBe(3);

    expect(resultUppercase.map(c => c.customerId)).toEqual(expectedCustomerIds);
    expect(resultLowercase.map(c => c.customerId)).toEqual(expectedCustomerIds);
    expect(resultMixedCase.map(c => c.customerId)).toEqual(expectedCustomerIds);

    expect(resultUppercase.map(c => c.customerName)).toEqual(expectedCustomerNames);
    expect(resultLowercase.map(c => c.customerName)).toEqual(expectedCustomerNames);
    expect(resultMixedCase.map(c => c.customerName)).toEqual(expectedCustomerNames);
  });
});