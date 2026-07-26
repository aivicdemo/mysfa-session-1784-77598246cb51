import { detectUnbilledAndDelayedCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-139
  test('請求予定日と実発行日が同日の場合、未請求・遅延フラグが付与されない', () => {
    const dealId = 'DEAL-001';
    const customerId = 'CUST-001';
    const billingPlannedDate = '2024-04-15';
    const billingActualDate = '2024-04-15';
    const dealAmount = 100000;
    const dealStatus = '受注';

    const input = {
      dealId,
      customerId,
      dealStatus,
      dealAmount,
      billingPlannedDate,
      billingActualDate,
    };

    const result = detectUnbilledAndDelayedCases(input);

    expect(result.dealId).toBe('DEAL-001');
    expect(result.hasUnbilledFlag).toBe(false);
    expect(result.hasDelayedFlag).toBe(false);
    expect(result.daysDifference).toBe(0);
  });
});