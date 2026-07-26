import { reconcileDealAndInvoiceData } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-131: [edge] 商談ステータスと請求データの自動照合・ズレ検出 - 請求書発行日が予定日と同日の場合、ズレ判定の閾値内として判定される
  test('請求書発行日が予定請求日と同日の場合、ズレなしと判定される', () => {
    const deal_id = 'DEAL-001';
    const deal_status = 'クローズ済み';
    const planned_invoice_date = new Date('2024-01-15T00:00:00Z');
    const actual_invoice_date = new Date('2024-01-15T00:00:00Z');
    const invoice_amount = 500000;
    const tolerance_days = 0;

    const result = reconcileDealAndInvoiceData({
      deal_id,
      deal_status,
      planned_invoice_date,
      actual_invoice_date,
      invoice_amount,
      tolerance_days,
    });

    expect(result.has_discrepancy).toBe(false);
    expect(result.discrepancy_days).toBe(0);
    expect(result.status).toBe('ズレなし');
    expect(result.is_within_tolerance).toBe(true);
    expect(result.deal_id).toBe('DEAL-001');
    expect(result.invoice_amount).toBe(500000);
  });

  test('請求書発行日が予定請求日より1日遅延し、許容閾値が1日の場合、許容範囲内と判定される', () => {
    const deal_id = 'DEAL-002';
    const deal_status = 'クローズ済み';
    const planned_invoice_date = new Date('2024-01-15T00:00:00Z');
    const actual_invoice_date = new Date('2024-01-16T00:00:00Z');
    const invoice_amount = 300000;
    const tolerance_days = 1;

    const result = reconcileDealAndInvoiceData({
      deal_id,
      deal_status,
      planned_invoice_date,
      actual_invoice_date,
      invoice_amount,
      tolerance_days,
    });

    expect(result.has_discrepancy).toBe(false);
    expect(result.discrepancy_days).toBe(1);
    expect(result.status).toBe('許容範囲内');
    expect(result.is_within_tolerance).toBe(true);
  });

  test('請求書発行日が予定請求日より2日遅延し、許容閾値が0日の場合、ズレありと判定される', () => {
    const deal_id = 'DEAL-003';
    const deal_status = 'クローズ済み';
    const planned_invoice_date = new Date('2024-01-15T00:00:00Z');
    const actual_invoice_date = new Date('2024-01-17T00:00:00Z');
    const invoice_amount = 750000;
    const tolerance_days = 0;

    const result = reconcileDealAndInvoiceData({
      deal_id,
      deal_status,
      planned_invoice_date,
      actual_invoice_date,
      invoice_amount,
      tolerance_days,
    });

    expect(result.has_discrepancy).toBe(true);
    expect(result.discrepancy_days).toBe(2);
    expect(result.status).toBe('ズレあり');
    expect(result.is_within_tolerance).toBe(false);
    expect(result.warning_flag).toBe(true);
  });

  test('請求書が未発行で請求日がnullの場合、未請求案件として判定される', () => {
    const deal_id = 'DEAL-004';
    const deal_status = 'クローズ済み';
    const planned_invoice_date = new Date('2024-01-15T00:00:00Z');
    const actual_invoice_date = null;
    const invoice_amount = 0;
    const tolerance_days = 0;

    const result = reconcileDealAndInvoiceData({
      deal_id,
      deal_status,
      planned_invoice_date,
      actual_invoice_date,
      invoice_amount,
      tolerance_days,
    });

    expect(result.has_discrepancy).toBe(true);
    expect(result.status).toBe('未請求案件');
    expect(result.is_unvoiced).toBe(true);
    expect(result.warning_flag).toBe(true);
  });

  test('商談ステータスが受注で、請求発行予定日が現在日時より前の場合、遅延案件として判定される', () => {
    const deal_id = 'DEAL-005';
    const deal_status = '受注';
    const planned_invoice_date = new Date('2024-01-10T00:00:00Z');
    const actual_invoice_date = new Date('2024-01-20T00:00:00Z');
    const invoice_amount = 200000;
    const tolerance_days = 5;
    const current_date = new Date('2024-01-25T00:00:00Z');

    const result = reconcileDealAndInvoiceData({
      deal_id,
      deal_status,
      planned_invoice_date,
      actual_invoice_date,
      invoice_amount,
      tolerance_days,
      current_date,
    });

    expect(result.has_discrepancy).toBe(true);
    expect(result.discrepancy_days).toBe(10);
    expect(result.status).toBe('遅延案件');
    expect(result.is_delayed).toBe(true);
    expect(result.warning_flag).toBe(true);
  });

  test('複数の商談を一括照合した場合、ズレありなしの結果が正確に集計される', () => {
    const deals = [
      {
        deal_id: 'DEAL-A',
        deal_status: 'クローズ済み',
        planned_invoice_date: new Date('2024-01-15T00:00:00Z'),
        actual_invoice_date: new Date('2024-01-15T00:00:00Z'),
        invoice_amount: 100000,
        tolerance_days: 0,
      },
      {
        deal_id: 'DEAL-B',
        deal_status: 'クローズ済み',
        planned_invoice_date: new Date('2024-01-15T00:00:00Z'),
        actual_invoice_date: new Date('2024-01-17T00:00:00Z'),
        invoice_amount: 200000,
        tolerance_days: 0,
      },
    ];

    const results = deals.map((deal) =>
      reconcileDealAndInvoiceData(deal)
    );

    expect(results).toHaveLength(2);
    expect(results[0].has_discrepancy).toBe(false);
    expect(results[0].status).toBe('ズレなし');
    expect(results[1].has_discrepancy).toBe(true);
    expect(results[1].status).toBe('ズレあり');
    expect(results[1].discrepancy_days).toBe(2);

    const discrepancy_count = results.filter((r) => r.has_discrepancy).length;
    const no_discrepancy_count = results.filter((r) => !r.has_discrepancy).length;
    expect(discrepancy_count).toBe(1);
    expect(no_discrepancy_count).toBe(1);
  });

  test('請求金額が0の場合、未請求として処理される', () => {
    const deal_id = 'DEAL-006';
    const deal_status = 'クローズ済み';
    const planned_invoice_date = new Date('2024-01-15T00:00:00Z');
    const actual_invoice_date = new Date('2024-01-15T00:00:00Z');
    const invoice_amount = 0;
    const tolerance_days = 0;

    const result = reconcileDealAndInvoiceData({
      deal_id,
      deal_status,
      planned_invoice_date,
      actual_invoice_date,
      invoice_amount,
      tolerance_days,
    });

    expect(result.has_discrepancy).toBe(true);
    expect(result.status).toBe('未請求案件');
    expect(result.is_unvoiced).toBe(true);
  });

  test('請求書発行日が予定請求日より前（早期発行）の場合、ズレありと判定される', () => {
    const deal_id = 'DEAL-007';
    const deal_status = 'クローズ済み';
    const planned_invoice_date = new Date('2024-01-15T00:00:00Z');
    const actual_invoice_date = new Date('2024-01-13T00:00:00Z');
    const invoice_amount = 400000;
    const tolerance_days = 0;

    const result = reconcileDealAndInvoiceData({
      deal_id,
      deal_status,
      planned_invoice_date,
      actual_invoice_date,
      invoice_amount,
      tolerance_days,
    });

    expect(result.has_discrepancy).toBe(true);
    expect(result.discrepancy_days).toBe(-2);
    expect(result.status).toBe('ズレあり');
    expect(result.is_within_tolerance).toBe(false);
  });

  test('許容範囲が負の値（無制限許容）の場合、すべてのズレが許容される', () => {
    const deal_id = 'DEAL-008';
    const deal_status = 'クローズ済み';
    const planned_invoice_date = new Date('2024-01-15T00:00:00Z');
    const actual_invoice_date = new Date('2024-02-15T00:00:00Z');
    const invoice_amount = 600000;
    const tolerance_days = -1;

    const result = reconcileDealAndInvoiceData({
      deal_id,
      deal_status,
      planned_invoice_date,
      actual_invoice_date,
      invoice_amount,
      tolerance_days,
    });

    expect(result.has_discrepancy).toBe(false);
    expect(result.discrepancy_days).toBe(31);
    expect(result.is_within_tolerance).toBe(true);
    expect(result.status).toBe('許容範囲内');
  });
});