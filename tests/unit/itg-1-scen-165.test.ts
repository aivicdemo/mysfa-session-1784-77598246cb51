import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-165
  test('顧客別商談進捗集計機能 - 初期接触ステータスの商談件数が0件のとき、その件数が0として集計される', () => {
    // テストデータ構築
    const customers = [
      { id: 'CUST_A', name: '顧客A' },
      { id: 'CUST_B', name: '顧客B' },
      { id: 'CUST_C', name: '顧客C' },
    ];

    const deals = [
      // 顧客Aに対して初期接触ステータスの商談3件
      {
        id: 'DEAL_A1',
        customerId: 'CUST_A',
        status: '初期接触',
        amount: 100000,
      },
      {
        id: 'DEAL_A2',
        customerId: 'CUST_A',
        status: '初期接触',
        amount: 150000,
      },
      {
        id: 'DEAL_A3',
        customerId: 'CUST_A',
        status: '初期接触',
        amount: 200000,
      },
      // 顧客Bに対して初期接触ステータスの商談なし（0件）
      // 顧客Cに対して初期接触ステータス以外の商談2件
      {
        id: 'DEAL_C1',
        customerId: 'CUST_C',
        status: '提案中',
        amount: 300000,
      },
      {
        id: 'DEAL_C2',
        customerId: 'CUST_C',
        status: '受注',
        amount: 500000,
      },
    ];

    // 顧客別商談進捗集計機能を実行
    const result = aggregateDealProgressByCustomer(customers, deals);

    // 集計結果から顧客Bの初期接触ステータスの商談件数を確認
    const customerBInitialContactEntry = result.find(
      (entry) => entry.customerId === 'CUST_B' && entry.status === '初期接触'
    );

    // 期待値: 顧客Bの初期接触ステータスの商談件数が0
    expect(customerBInitialContactEntry).toBeDefined();
    expect(customerBInitialContactEntry?.count).toBe(0);
    expect(customerBInitialContactEntry?.totalAmount).toBe(0);

    // 集計データには顧客B: {ステータス: '初期接触', 件数: 0} というレコードが含まれることを確認
    expect(
      result.some(
        (entry) =>
          entry.customerId === 'CUST_B' &&
          entry.status === '初期接触' &&
          entry.count === 0
      )
    ).toBe(true);

    // 他の顧客の集計が正しいことも検証
    const customerAInitialContactEntry = result.find(
      (entry) => entry.customerId === 'CUST_A' && entry.status === '初期接触'
    );
    expect(customerAInitialContactEntry?.count).toBe(3);
    expect(customerAInitialContactEntry?.totalAmount).toBe(450000);

    // 顧客Cのステータス別集計が正しいことを検証
    const customerCProposalEntry = result.find(
      (entry) => entry.customerId === 'CUST_C' && entry.status === '提案中'
    );
    expect(customerCProposalEntry?.count).toBe(1);
    expect(customerCProposalEntry?.totalAmount).toBe(300000);

    const customerCOrderEntry = result.find(
      (entry) => entry.customerId === 'CUST_C' && entry.status === '受注'
    );
    expect(customerCOrderEntry?.count).toBe(1);
    expect(customerCOrderEntry?.totalAmount).toBe(500000);
  });
});