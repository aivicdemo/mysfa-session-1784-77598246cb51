import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

// Mock types based on business context
interface Customer {
  customerId: string;
  customerName: string;
}

interface Deal {
  dealId: string;
  customerId: string;
  status: string;
  amount: number;
  createdAt: Date;
}

interface DealProgressSummary {
  customerId: string;
  customerName: string;
  statusBreakdown: {
    [statusKey: string]: {
      count: number;
      totalAmount: number;
    };
  };
  totalDealCount: number;
  totalAmount: number;
}

describe('売上実績・請求状況のリアルタイム集計・レポート生成 - 顧客別商談進捗集計', () => {
  // SCEN-195
  test('すべてのステータスに商談が存在するとき、各ステータスが正確に集計される', () => {
    // Setup: テスト用顧客データを作成
    const testCustomer: Customer = {
      customerId: 'CUST-001',
      customerName: 'テスト顧客A',
    };

    // Setup: テスト用商談データを作成（各ステータス別に指定件数）
    const testDeals: Deal[] = [
      // 初期段階: 3件
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        status: '初期接触',
        amount: 100000,
        createdAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-001',
        status: '初期接触',
        amount: 150000,
        createdAt: new Date('2024-01-02T10:00:00Z'),
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-001',
        status: '初期接触',
        amount: 120000,
        createdAt: new Date('2024-01-03T10:00:00Z'),
      },
      // 提案中: 2件
      {
        dealId: 'DEAL-004',
        customerId: 'CUST-001',
        status: '提案中',
        amount: 250000,
        createdAt: new Date('2024-01-04T10:00:00Z'),
      },
      {
        dealId: 'DEAL-005',
        customerId: 'CUST-001',
        status: '提案中',
        amount: 200000,
        createdAt: new Date('2024-01-05T10:00:00Z'),
      },
      // 交渉中: 4件
      {
        dealId: 'DEAL-006',
        customerId: 'CUST-001',
        status: '交渉中',
        amount: 300000,
        createdAt: new Date('2024-01-06T10:00:00Z'),
      },
      {
        dealId: 'DEAL-007',
        customerId: 'CUST-001',
        status: '交渉中',
        amount: 350000,
        createdAt: new Date('2024-01-07T10:00:00Z'),
      },
      {
        dealId: 'DEAL-008',
        customerId: 'CUST-001',
        status: '交渉中',
        amount: 280000,
        createdAt: new Date('2024-01-08T10:00:00Z'),
      },
      {
        dealId: 'DEAL-009',
        customerId: 'CUST-001',
        status: '交渉中',
        amount: 320000,
        createdAt: new Date('2024-01-09T10:00:00Z'),
      },
      // 受注: 1件
      {
        dealId: 'DEAL-010',
        customerId: 'CUST-001',
        status: '受注',
        amount: 500000,
        createdAt: new Date('2024-01-10T10:00:00Z'),
      },
    ];

    // Execute: 顧客別商談進捗集計機能を実行
    const result: DealProgressSummary = aggregateDealProgressByCustomer(
      testCustomer.customerId,
      testDeals
    );

    // Verify: 集計結果が返却されることを確認
    expect(result).toBeDefined();
    expect(result.customerId).toBe('CUST-001');
    expect(result.customerName).toBe('テスト顧客A');

    // Verify: 集計結果の各ステータス別の件数を検証
    expect(result.statusBreakdown['初期接触'].count).toBe(3);
    expect(result.statusBreakdown['提案中'].count).toBe(2);
    expect(result.statusBreakdown['交渉中'].count).toBe(4);
    expect(result.statusBreakdown['受注'].count).toBe(1);

    // Verify: 集計結果の合計件数が10件であることを確認
    expect(result.totalDealCount).toBe(10);

    // Verify: 集計結果の金額合計を検証（初期段階: 370000 + 提案中: 450000 + 交渉中: 1250000 + 受注: 500000 = 2570000）
    expect(result.statusBreakdown['初期接触'].totalAmount).toBe(370000);
    expect(result.statusBreakdown['提案中'].totalAmount).toBe(450000);
    expect(result.statusBreakdown['交渉中'].totalAmount).toBe(1250000);
    expect(result.statusBreakdown['受注'].totalAmount).toBe(500000);
    expect(result.totalAmount).toBe(2570000);
  });
});