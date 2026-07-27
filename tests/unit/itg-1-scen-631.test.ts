import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock data sources
interface Deal {
  id: string;
  customerId: string;
  amount: number;
  status: string;
  expectedBillingDate: string;
}

interface Invoice {
  id: string;
  dealId: string;
  issuedDate: string;
  amount: number;
}

interface ReconciliationResult {
  discrepancies: Array<{
    dealId: string;
    dealStatus: string;
    expectedBillingDate: string;
    invoiceIssuedDate?: string;
    discrepancyType: 'unbilled' | 'delayed';
  }>;
  totalUnbilledDeals: number;
  totalDelayedDeals: number;
}

// Import the function under test
import { reconcileDealStatusWithInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  let dealDataSource: {
    fetchDeals: jest.Mock<Promise<Deal[]>>;
  };
  let invoiceDataSource: {
    fetchInvoices: jest.Mock<Promise<Invoice[]>>;
  };

  beforeEach(() => {
    dealDataSource = {
      fetchDeals: jest.fn(),
    };
    invoiceDataSource = {
      fetchInvoices: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-631
  it('対象商談が0件のとき、空の照合結果リストが返される', async () => {
    // Arrange: 空の商談リストを返すようモック化
    dealDataSource.fetchDeals.mockResolvedValue([]);

    // Arrange: 請求書データが存在しないよう設定
    invoiceDataSource.fetchInvoices.mockResolvedValue([]);

    // Act: 商談ステータスと請求書発行状況の自動照合・ズレ検出機能を実行
    const result: ReconciliationResult = await reconcileDealStatusWithInvoices(
      dealDataSource,
      invoiceDataSource
    );

    // Assert: 照合結果が空のリスト（長さ0の配列）として返される
    expect(result.discrepancies).toEqual([]);
    expect(result.discrepancies.length).toBe(0);

    // Assert: ズレ検出オブジェクトも存在しない
    expect(result.totalUnbilledDeals).toBe(0);
    expect(result.totalDelayedDeals).toBe(0);

    // Assert: データソースが正しく呼び出されたことを確認
    expect(dealDataSource.fetchDeals).toHaveBeenCalledTimes(1);
    expect(invoiceDataSource.fetchInvoices).toHaveBeenCalledTimes(1);
  });
});