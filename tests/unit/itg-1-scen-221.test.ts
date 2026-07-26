import { detectUnbilledDealsByStatusAndInvoiceStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-221
  test('商談ステータスが受注であるが請求書が発行されていない案件が未請求として検出される', () => {
    // 前提: 商談レコードが営業管理システムに存在し、ステータスと請求書発行状況のデータが記録されている状態
    const deals = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-A',
        customerName: '顧客A株式会社',
        amount: 500000,
        status: '受注',
        invoiceIssued: false,
        invoiceIssuedDate: null,
        invoiceAmount: null,
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-B',
        customerName: '顧客B有限会社',
        amount: 300000,
        status: '受注',
        invoiceIssued: false,
        invoiceIssuedDate: null,
        invoiceAmount: null,
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-C',
        customerName: '顧客C株式会社',
        amount: 750000,
        status: '受注',
        invoiceIssued: true,
        invoiceIssuedDate: '2024-04-10T00:00:00Z',
        invoiceAmount: 750000,
      },
      {
        dealId: 'DEAL-004',
        customerId: 'CUST-D',
        customerName: '顧客D株式会社',
        amount: 200000,
        status: '提案中',
        invoiceIssued: false,
        invoiceIssuedDate: null,
        invoiceAmount: null,
      },
      {
        dealId: 'DEAL-005',
        customerId: 'CUST-E',
        customerName: '顧客E企業',
        amount: 600000,
        status: '受注',
        invoiceIssued: true,
        invoiceIssuedDate: '2024-04-15T00:00:00Z',
        invoiceAmount: 600000,
      },
    ];

    // 期待結果: 商談ステータスが「受注」かつ請求書が未発行の案件を「未請求案件」として特定
    const result = detectUnbilledDealsByStatusAndInvoiceStatus(deals);

    // 検証1: 未請求案件が正確に検出されること
    expect(result.unbilledDeals).toHaveLength(2);

    // 検証2: 検出された未請求案件の詳細情報が正確に表示されること
    expect(result.unbilledDeals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: 'DEAL-001',
          customerId: 'CUST-A',
          customerName: '顧客A株式会社',
          amount: 500000,
          status: '受注',
          invoiceIssued: false,
        }),
        expect.objectContaining({
          dealId: 'DEAL-002',
          customerId: 'CUST-B',
          customerName: '顧客B有限会社',
          amount: 300000,
          status: '受注',
          invoiceIssued: false,
        }),
      ])
    );

    // 検証3: 請求済みの受注案件が検出結果に含まれていないこと
    expect(result.unbilledDeals).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: 'DEAL-003',
        }),
        expect.objectContaining({
          dealId: 'DEAL-005',
        }),
      ])
    );

    // 検証4: ステータスが「受注」以外の案件は除外されること
    expect(result.unbilledDeals).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: 'DEAL-004',
        }),
      ])
    );

    // 検証5: 検出された未請求案件の合計金額が正確に計算されること
    const expectedTotalUnbilledAmount = 500000 + 300000;
    expect(result.totalUnbilledAmount).toBe(expectedTotalUnbilledAmount);

    // 検証6: 検出処理の実行結果が成功状態であること
    expect(result.processStatus).toBe('success');

    // 検証7: 処理完了時刻が記録されていること
    expect(result.detectionTimestamp).toBeDefined();
    expect(typeof result.detectionTimestamp).toBe('string');
  });
});