import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-198
  test('ステータスフィールドが欠落している商談が含まれるとき、エラーまたは除外される', () => {
    const deals = [
      {
        dealId: 'DEAL001',
        customerId: 'CUST001',
        customerName: '株式会社A',
        status: 'initial_contact',
        amount: 1000000,
      },
      {
        dealId: 'DEAL002',
        customerId: 'CUST001',
        customerName: '株式会社A',
        status: 'proposal',
        amount: 500000,
      },
      {
        dealId: 'DEAL003',
        customerId: 'CUST001',
        customerName: '株式会社A',
        status: null,
        amount: 750000,
      },
    ];

    const result = aggregateDealProgressByCustomer(deals);

    // エラーが発生するか、該当商談が除外されるかのいずれかを検証
    if (result instanceof Error || (typeof result === 'object' && result !== null && 'error' in result)) {
      // ケース1: エラーが発生する場合
      expect(result.toString()).toMatch(/ステータス|必須フィールド/);
    } else {
      // ケース2: 該当商談が除外される場合
      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.totalDealsProcessed).toBe(2);
      expect(result.summary.dealsExcluded).toBe(1);
      
      // 集計結果の顧客別データを検証
      const customerData = result.customerAggregations.find(
        (agg: { customerId: string }) => agg.customerId === 'CUST001'
      );
      expect(customerData).toBeDefined();
      
      // ステータス別集計を検証（status: nullの商談は含まれない）
      expect(customerData.progressByStatus).toBeDefined();
      expect(customerData.progressByStatus.initial_contact).toBeDefined();
      expect(customerData.progressByStatus.initial_contact.count).toBe(1);
      expect(customerData.progressByStatus.initial_contact.totalAmount).toBe(1000000);
      
      expect(customerData.progressByStatus.proposal).toBeDefined();
      expect(customerData.progressByStatus.proposal.count).toBe(1);
      expect(customerData.progressByStatus.proposal.totalAmount).toBe(500000);
      
      // status: nullの商談は統計に含まれていない
      expect(customerData.totalDealsCount).toBe(2);
      expect(customerData.totalAmount).toBe(1500000);
      
      // 除外ログまたはメタデータが利用可能
      expect(result.excludedDeals).toBeDefined();
      expect(result.excludedDeals.length).toBe(1);
      expect(result.excludedDeals[0].dealId).toBe('DEAL003');
      expect(result.excludedDeals[0].reason).toMatch(/ステータス|必須/);
    }
  });
});