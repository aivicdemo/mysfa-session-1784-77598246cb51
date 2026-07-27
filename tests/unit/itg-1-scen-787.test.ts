import { extractInvoicingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-787: 複数件の請求対象データが逆順で格納されているとき、全件が正しく抽出される', () => {
    // テストデータセット: 5件のデータを逆順（降順）で準備
    const testDataSet = [
      {
        id: 5,
        customerId: 'CUST005',
        invoiceAmount: 150000,
        invoicePeriod: '2024-05-01~2024-05-31',
        status: '未請求',
        createdAt: new Date('2024-05-31T23:59:59Z'),
      },
      {
        id: 4,
        customerId: 'CUST004',
        invoiceAmount: 120000,
        invoicePeriod: '2024-05-01~2024-05-31',
        status: '未請求',
        createdAt: new Date('2024-05-30T23:59:59Z'),
      },
      {
        id: 3,
        customerId: 'CUST003',
        invoiceAmount: 90000,
        invoicePeriod: '2024-05-01~2024-05-31',
        status: '未請求',
        createdAt: new Date('2024-05-29T23:59:59Z'),
      },
      {
        id: 2,
        customerId: 'CUST002',
        invoiceAmount: 60000,
        invoicePeriod: '2024-05-01~2024-05-31',
        status: '未請求',
        createdAt: new Date('2024-05-28T23:59:59Z'),
      },
      {
        id: 1,
        customerId: 'CUST001',
        invoiceAmount: 30000,
        invoicePeriod: '2024-05-01~2024-05-31',
        status: '未請求',
        createdAt: new Date('2024-05-27T23:59:59Z'),
      },
    ];

    // 抽出条件: ステータス = 未請求
    const extractionCondition = {
      status: '未請求',
    };

    // 請求対象データ抽出機能を実行
    const result = extractInvoicingTargetData(testDataSet, extractionCondition);

    // 抽出結果の件数が5件であることを検証
    expect(result).toHaveLength(5);

    // 抽出結果の各レコードが正確に返されているか検証
    expect(result[0]).toEqual({
      id: 5,
      customerId: 'CUST005',
      invoiceAmount: 150000,
      invoicePeriod: '2024-05-01~2024-05-31',
      status: '未請求',
      createdAt: new Date('2024-05-31T23:59:59Z'),
    });

    expect(result[1]).toEqual({
      id: 4,
      customerId: 'CUST004',
      invoiceAmount: 120000,
      invoicePeriod: '2024-05-01~2024-05-31',
      status: '未請求',
      createdAt: new Date('2024-05-30T23:59:59Z'),
    });

    expect(result[2]).toEqual({
      id: 3,
      customerId: 'CUST003',
      invoiceAmount: 90000,
      invoicePeriod: '2024-05-01~2024-05-31',
      status: '未請求',
      createdAt: new Date('2024-05-29T23:59:59Z'),
    });

    expect(result[3]).toEqual({
      id: 2,
      customerId: 'CUST002',
      invoiceAmount: 60000,
      invoicePeriod: '2024-05-01~2024-05-31',
      status: '未請求',
      createdAt: new Date('2024-05-28T23:59:59Z'),
    });

    expect(result[4]).toEqual({
      id: 1,
      customerId: 'CUST001',
      invoiceAmount: 30000,
      invoicePeriod: '2024-05-01~2024-05-31',
      status: '未請求',
      createdAt: new Date('2024-05-27T23:59:59Z'),
    });

    // 各レコードのID、顧客ID、請求金額、請求対象期間がそれぞれ異なる値で正確に返されているか検証
    const extractedIds = result.map((record) => record.id);
    const extractedCustomerIds = result.map((record) => record.customerId);
    const extractedInvoiceAmounts = result.map((record) => record.invoiceAmount);

    expect(extractedIds).toEqual([5, 4, 3, 2, 1]);
    expect(extractedCustomerIds).toEqual([
      'CUST005',
      'CUST004',
      'CUST003',
      'CUST002',
      'CUST001',
    ]);
    expect(extractedInvoiceAmounts).toEqual([150000, 120000, 90000, 60000, 30000]);

    // 抽出結果がすべてステータス「未請求」であることを確認
    const allStatusAreUnbilled = result.every(
      (record) => record.status === '未請求'
    );
    expect(allStatusAreUnbilled).toBe(true);
  });
});