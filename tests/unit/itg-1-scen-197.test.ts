import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-197
  test('顧客別商談進捗集計機能 - 金額フィールドが欠落している商談が含まれるとき、エラーまたは金額0として扱われる', () => {
    const testDataset = [
      {
        customerId: 'CUST001',
        customerName: '顧客A',
        dealId: 'DEAL001',
        dealStatus: '初期接触',
        dealAmount: 100000,
      },
      {
        customerId: 'CUST001',
        customerName: '顧客A',
        dealId: 'DEAL002',
        dealStatus: '提案中',
        dealAmount: null,
      },
      {
        customerId: 'CUST001',
        customerName: '顧客A',
        dealId: 'DEAL003',
        dealStatus: '交渉中',
        dealAmount: undefined,
      },
      {
        customerId: 'CUST001',
        customerName: '顧客A',
        dealId: 'DEAL004',
        dealStatus: '受注',
        dealAmount: 50000,
      },
    ];

    const handleMissingAmount = (dataset: Array<{
      customerId: string;
      customerName: string;
      dealId: string;
      dealStatus: string;
      dealAmount: number | null | undefined;
    }>) => {
      try {
        const result = aggregateDealProgressByCustomer(dataset);
        return { success: true, result };
      } catch (error) {
        return { success: false, error };
      }
    };

    const executionResult = handleMissingAmount(testDataset);

    if (executionResult.success) {
      const result = executionResult.result;
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(Array.isArray(result)).toBe(true);

      const customerAggregation = result.find(
        (agg: any) => agg.customerId === 'CUST001'
      );
      expect(customerAggregation).toBeDefined();

      const statusDistribution = customerAggregation.statusDistribution;
      expect(statusDistribution).toBeDefined();

      const initialContactEntry = statusDistribution.find(
        (s: any) => s.status === '初期接触'
      );
      expect(initialContactEntry).toBeDefined();
      expect(initialContactEntry.count).toBe(1);
      expect(initialContactEntry.totalAmount).toBe(100000);

      const proposalEntry = statusDistribution.find(
        (s: any) => s.status === '提案中'
      );
      expect(proposalEntry).toBeDefined();
      expect(proposalEntry.count).toBe(1);
      expect(proposalEntry.totalAmount).toBe(0);

      const negotiationEntry = statusDistribution.find(
        (s: any) => s.status === '交渉中'
      );
      expect(negotiationEntry).toBeDefined();
      expect(negotiationEntry.count).toBe(1);
      expect(negotiationEntry.totalAmount).toBe(0);

      const closedEntry = statusDistribution.find(
        (s: any) => s.status === '受注'
      );
      expect(closedEntry).toBeDefined();
      expect(closedEntry.count).toBe(1);
      expect(closedEntry.totalAmount).toBe(50000);

      const grandTotal = customerAggregation.totalAmount;
      expect(grandTotal).toBe(150000);
      expect(Number.isNaN(grandTotal)).toBe(false);
      expect(Number.isFinite(grandTotal)).toBe(true);
    } else {
      const thrownError = executionResult.error;
      expect(thrownError).toBeDefined();
      expect(thrownError.message).toMatch(/金額フィールド/);
    }
  });
});