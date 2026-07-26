import { classifyDealsByProgressStatus } from '../../src/logic/it-1';

describe('顧客別商談進捗分類機能', () => {
  // SCEN-118
  test('複数顧客の商談が進捗ステータス別に正しく分類される', () => {
    const deals = [
      {
        customerId: 'CUST_A',
        customerName: '顧客A',
        dealId: 'DEAL_A001',
        dealName: '案件A',
        status: '初期接触',
        amount: 100000,
      },
      {
        customerId: 'CUST_B',
        customerName: '顧客B',
        dealId: 'DEAL_B001',
        dealName: '案件B',
        status: '提案中',
        amount: 250000,
      },
      {
        customerId: 'CUST_B',
        customerName: '顧客B',
        dealId: 'DEAL_B002',
        dealName: '案件B-2',
        status: '提案中',
        amount: 150000,
      },
      {
        customerId: 'CUST_C',
        customerName: '顧客C',
        dealId: 'DEAL_C001',
        dealName: '案件C',
        status: '交渉中',
        amount: 500000,
      },
      {
        customerId: 'CUST_D',
        customerName: '顧客D',
        dealId: 'DEAL_D001',
        dealName: '案件D',
        status: '受注',
        amount: 1000000,
      },
      {
        customerId: 'CUST_E',
        customerName: '顧客E',
        dealId: 'DEAL_E001',
        dealName: '案件E',
        status: '失注',
        amount: 300000,
      },
    ];

    const result = classifyDealsByProgressStatus(deals);

    expect(result).toEqual({
      '初期接触': [
        {
          customerId: 'CUST_A',
          customerName: '顧客A',
          count: 1,
          totalAmount: 100000,
          deals: [
            {
              dealId: 'DEAL_A001',
              dealName: '案件A',
              amount: 100000,
            },
          ],
        },
      ],
      '提案中': [
        {
          customerId: 'CUST_B',
          customerName: '顧客B',
          count: 2,
          totalAmount: 400000,
          deals: [
            {
              dealId: 'DEAL_B001',
              dealName: '案件B',
              amount: 250000,
            },
            {
              dealId: 'DEAL_B002',
              dealName: '案件B-2',
              amount: 150000,
            },
          ],
        },
      ],
      '交渉中': [
        {
          customerId: 'CUST_C',
          customerName: '顧客C',
          count: 1,
          totalAmount: 500000,
          deals: [
            {
              dealId: 'DEAL_C001',
              dealName: '案件C',
              amount: 500000,
            },
          ],
        },
      ],
      '受注': [
        {
          customerId: 'CUST_D',
          customerName: '顧客D',
          count: 1,
          totalAmount: 1000000,
          deals: [
            {
              dealId: 'DEAL_D001',
              dealName: '案件D',
              amount: 1000000,
            },
          ],
        },
      ],
      '失注': [
        {
          customerId: 'CUST_E',
          customerName: '顧客E',
          count: 1,
          totalAmount: 300000,
          deals: [
            {
              dealId: 'DEAL_E001',
              dealName: '案件E',
              amount: 300000,
            },
          ],
        },
      ],
    });
  });
});