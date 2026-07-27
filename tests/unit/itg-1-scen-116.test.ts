import { extractDealsByMonthlyPeriod } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録表示 - 月次報告期限データ抽出', () => {
  // SCEN-116
  test('抽出対象期間内に作成された商談レコード複数件の場合、全件が返される', () => {
    // 対象期間: 2024年1月1日～2024年1月31日
    const extractionPeriodStart = new Date('2024-01-01T00:00:00Z');
    const extractionPeriodEnd = new Date('2024-01-31T23:59:59Z');
    // 処理日付を対象期間の中日に設定
    const processDate = new Date('2024-01-15T12:00:00Z');

    // 抽出対象期間内のテストデータ
    const dealWithinPeriod1 = {
      deal_id: 'DEAL_001',
      deal_name: '案件A',
      amount: 1000000,
      created_at: new Date('2024-01-05T10:00:00Z'),
      customer_id: 'CUST_001',
      status: '提案中',
    };

    const dealWithinPeriod2 = {
      deal_id: 'DEAL_002',
      deal_name: '案件B',
      amount: 1500000,
      created_at: new Date('2024-01-15T14:30:00Z'),
      customer_id: 'CUST_002',
      status: '交渉中',
    };

    const dealWithinPeriod3 = {
      deal_id: 'DEAL_003',
      deal_name: '案件C',
      amount: 2000000,
      created_at: new Date('2024-01-28T09:15:00Z'),
      customer_id: 'CUST_003',
      status: '提案中',
    };

    // 抽出対象期間外のテストデータ
    const dealBeforePeriod = {
      deal_id: 'DEAL_X',
      deal_name: '案件X',
      amount: 500000,
      created_at: new Date('2023-12-25T11:00:00Z'),
      customer_id: 'CUST_X',
      status: '受注',
    };

    const dealAfterPeriod = {
      deal_id: 'DEAL_Y',
      deal_name: '案件Y',
      amount: 750000,
      created_at: new Date('2024-02-05T16:45:00Z'),
      customer_id: 'CUST_Y',
      status: '失注',
    };

    const allDeals = [
      dealBeforePeriod,
      dealWithinPeriod1,
      dealWithinPeriod2,
      dealWithinPeriod3,
      dealAfterPeriod,
    ];

    // 月次報告期限・データ抽出処理を実行
    const result = extractDealsByMonthlyPeriod(
      allDeals,
      extractionPeriodStart,
      extractionPeriodEnd,
      processDate
    );

    // 抽出結果の検証
    expect(result).toHaveLength(3);

    // 抽出された商談が対象期間内の3件であることを確認
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deal_id: 'DEAL_001',
          deal_name: '案件A',
          amount: 1000000,
          created_at: dealWithinPeriod1.created_at,
        }),
        expect.objectContaining({
          deal_id: 'DEAL_002',
          deal_name: '案件B',
          amount: 1500000,
          created_at: dealWithinPeriod2.created_at,
        }),
        expect.objectContaining({
          deal_id: 'DEAL_003',
          deal_name: '案件C',
          amount: 2000000,
          created_at: dealWithinPeriod3.created_at,
        }),
      ])
    );

    // 対象期間外のレコードが含まれていないことを確認
    const extractedDealIds = result.map((deal) => deal.deal_id);
    expect(extractedDealIds).not.toContain('DEAL_X');
    expect(extractedDealIds).not.toContain('DEAL_Y');

    // 抽出された商談の内容が登録時のテストデータと完全に一致していることを確認
    const extractedDeal1 = result.find((d) => d.deal_id === 'DEAL_001');
    expect(extractedDeal1).toEqual(
      expect.objectContaining({
        deal_name: '案件A',
        amount: 1000000,
      })
    );

    const extractedDeal2 = result.find((d) => d.deal_id === 'DEAL_002');
    expect(extractedDeal2).toEqual(
      expect.objectContaining({
        deal_name: '案件B',
        amount: 1500000,
      })
    );

    const extractedDeal3 = result.find((d) => d.deal_id === 'DEAL_003');
    expect(extractedDeal3).toEqual(
      expect.objectContaining({
        deal_name: '案件C',
        amount: 2000000,
      })
    );
  });
});