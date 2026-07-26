import { classifyDealsByCustomerAndStatus } from '../../src/logic/it-1';

describe('顧客別商談進捗分類機能', () => {
  // SCEN-121
  test('不正なステータス値を含む商談がエラーとなる', () => {
    const deals_with_invalid_status_string = [
      {
        customer_id: 'CUST001',
        deal_id: 'DEAL001',
        status: 'invalid_status',
        amount: 100000,
      },
    ];

    const deals_with_null_status = [
      {
        customer_id: 'CUST001',
        deal_id: 'DEAL001',
        status: null,
        amount: 100000,
      },
    ];

    const deals_with_undefined_status = [
      {
        customer_id: 'CUST001',
        deal_id: 'DEAL001',
        status: undefined,
        amount: 100000,
      },
    ];

    const deals_with_empty_status = [
      {
        customer_id: 'CUST001',
        deal_id: 'DEAL001',
        status: '',
        amount: 100000,
      },
    ];

    expect(() => {
      classifyDealsByCustomerAndStatus(deals_with_invalid_status_string);
    }).toThrow(/status/i);

    expect(() => {
      classifyDealsByCustomerAndStatus(deals_with_null_status);
    }).toThrow(/status/i);

    expect(() => {
      classifyDealsByCustomerAndStatus(deals_with_undefined_status);
    }).toThrow(/status/i);

    expect(() => {
      classifyDealsByCustomerAndStatus(deals_with_empty_status);
    }).toThrow(/status/i);
  });
});