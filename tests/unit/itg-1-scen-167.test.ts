import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { detectUnbilledDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-167: [normal] 複数の商談レコードから未請求案件のみをフィルタリングし、正確にリスト化できる
  test('複数の商談レコードから未請求案件のみをフィルタリングし、正確にリスト化できる', () => {
    // 前提: 営業管理システムに複数の商談レコード（請求済み、未請求、部分請求など異なるステータス）が存在
    const dealRecords = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        customerName: '顧客A株式会社',
        dealAmount: 500000,
        dealStatus: '受注',
        billingStatus: '請求済み',
        billingDate: '2024-04-10',
        invoiceId: 'INV-001',
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-002',
        customerName: '顧客B株式会社',
        dealAmount: 300000,
        dealStatus: '受注',
        billingStatus: '未請求',
        billingDate: null,
        invoiceId: null,
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-003',
        customerName: '顧客C株式会社',
        dealAmount: 750000,
        dealStatus: '完了',
        billingStatus: '部分請求',
        billingDate: '2024-04-12',
        invoiceId: 'INV-003',
      },
      {
        dealId: 'DEAL-004',
        customerId: 'CUST-004',
        customerName: '顧客D株式会社',
        dealAmount: 250000,
        dealStatus: '受注',
        billingStatus: '未請求',
        billingDate: null,
        invoiceId: null,
      },
      {
        dealId: 'DEAL-005',
        customerId: 'CUST-005',
        customerName: '顧客E株式会社',
        dealAmount: 1000000,
        dealStatus: '完了',
        billingStatus: '請求済み',
        billingDate: '2024-04-05',
        invoiceId: 'INV-005',
      },
      {
        dealId: 'DEAL-006',
        customerId: 'CUST-006',
        customerName: '顧客F株式会社',
        dealAmount: 450000,
        dealStatus: '受注',
        billingStatus: '未請求',
        billingDate: null,
        invoiceId: null,
      },
    ];

    const filterCondition = {
      billingStatus: '未請求',
    };

    // 発生条件: フィルタ条件として「請求状況：未請求」を選択してフィルタを実行
    const filteredResult = detectUnbilledDeals(dealRecords, filterCondition);

    // 結果: フィルタリング結果として未請求案件のみが正確にリスト化される
    // 1. 件数の検証：未請求案件は DEAL-002, DEAL-004, DEAL-006 の3件
    expect(filteredResult.unbilledDeals).toHaveLength(3);

    // 2. フィルタ実行前の全商談レコード数との比較
    expect(dealRecords).toHaveLength(6);
    expect(filteredResult.totalDealsCount).toBe(6);
    expect(filteredResult.unbilledDealsCount).toBe(3);

    // 3. 表示された全ての商談レコードの請求状況が「未請求」であることを確認
    filteredResult.unbilledDeals.forEach((deal) => {
      expect(deal.billingStatus).toBe('未請求');
      expect(deal.billingDate).toBeNull();
      expect(deal.invoiceId).toBeNull();
    });

    // 4. 未請求案件の商談ID、金額、顧客名などの情報が正確に表示されている
    expect(filteredResult.unbilledDeals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: 'DEAL-002',
          customerId: 'CUST-002',
          customerName: '顧客B株式会社',
          dealAmount: 300000,
          dealStatus: '受注',
          billingStatus: '未請求',
        }),
        expect.objectContaining({
          dealId: 'DEAL-004',
          customerId: 'CUST-004',
          customerName: '顧客D株式会社',
          dealAmount: 250000,
          dealStatus: '受注',
          billingStatus: '未請求',
        }),
        expect.objectContaining({
          dealId: 'DEAL-006',
          customerId: 'CUST-006',
          customerName: '顧客F株式会社',
          dealAmount: 450000,
          dealStatus: '受注',
          billingStatus: '未請求',
        }),
      ])
    );

    // 5. 未請求案件の合計金額を検証
    // DEAL-002: 300000 + DEAL-004: 250000 + DEAL-006: 450000 = 1000000
    const totalUnbilledAmount = filteredResult.unbilledDeals.reduce(
      (sum, deal) => sum + deal.dealAmount,
      0
    );
    expect(totalUnbilledAmount).toBe(1000000);

    // 6. 複数回のフィルタリング実行で同じ結果が得られる一貫性を確認
    const secondFilterResult = detectUnbilledDeals(dealRecords, filterCondition);
    expect(secondFilterResult.unbilledDeals).toHaveLength(
      filteredResult.unbilledDeals.length
    );
    expect(secondFilterResult.unbilledDealsCount).toBe(
      filteredResult.unbilledDealsCount
    );

    // 7. 請求済みや部分請求の案件が含まれていないことを確認
    const billedDealIds = filteredResult.unbilledDeals.map((d) => d.dealId);
    expect(billedDealIds).not.toContain('DEAL-001');
    expect(billedDealIds).not.toContain('DEAL-003');
    expect(billedDealIds).not.toContain('DEAL-005');

    // 8. データエクスポート機能の出力検証
    expect(filteredResult.csvExportData).toBeDefined();
    const csvLines = filteredResult.csvExportData.split('\n');
    // ヘッダー行 + 3件の未請求案件データ
    expect(csvLines.length).toBeGreaterThanOrEqual(4);

    // 9. CSVデータの整合性確認
    const csvContent = filteredResult.csvExportData;
    expect(csvContent).toContain('DEAL-002');
    expect(csvContent).toContain('DEAL-004');
    expect(csvContent).toContain('DEAL-006');
    expect(csvContent).toContain('顧客B株式会社');
    expect(csvContent).toContain('顧客D株式会社');
    expect(csvContent).toContain('顧客F株式会社');
    expect(csvContent).toContain('300000');
    expect(csvContent).toContain('250000');
    expect(csvContent).toContain('450000');
  });
});