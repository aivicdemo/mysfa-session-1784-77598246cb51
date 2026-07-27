import { detectDelayedCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-568
  test('商談ステータスと請求書の自動照合・遅延案件検出 - 請求予定日を超過した案件が複数件のとき全件が遅延案件リストに追加される', () => {
    const baselineDate = new Date('2024-01-15T10:00:00Z');

    const dealA = {
      id: 'deal-a',
      name: '商談A',
      status: '見積中',
      invoiceExpectedDate: new Date('2024-01-10T00:00:00Z'),
    };

    const dealB = {
      id: 'deal-b',
      name: '商談B',
      status: '受注確定',
      invoiceExpectedDate: new Date('2024-01-12T00:00:00Z'),
    };

    const dealC = {
      id: 'deal-c',
      name: '商談C',
      status: '受注確定',
      invoiceExpectedDate: new Date('2024-01-14T00:00:00Z'),
    };

    const dealD = {
      id: 'deal-d',
      name: '商談D',
      status: '受注確定',
      invoiceExpectedDate: new Date('2024-01-20T00:00:00Z'),
    };

    const deals = [dealA, dealB, dealC, dealD];

    const delayedCases = detectDelayedCases(deals, baselineDate);

    expect(delayedCases).toHaveLength(3);

    const delayedCaseIds = delayedCases.map((c) => c.id);
    expect(delayedCaseIds).toContain('deal-a');
    expect(delayedCaseIds).toContain('deal-b');
    expect(delayedCaseIds).toContain('deal-c');
    expect(delayedCaseIds).not.toContain('deal-d');

    const caseA = delayedCases.find((c) => c.id === 'deal-a')!;
    expect(caseA.name).toBe('商談A');
    expect(caseA.invoiceExpectedDate).toEqual(new Date('2024-01-10T00:00:00Z'));
    expect(caseA.overdueDays).toBe(5);
    expect(caseA.status).toBe('見積中');

    const caseB = delayedCases.find((c) => c.id === 'deal-b')!;
    expect(caseB.name).toBe('商談B');
    expect(caseB.invoiceExpectedDate).toEqual(new Date('2024-01-12T00:00:00Z'));
    expect(caseB.overdueDays).toBe(3);
    expect(caseB.status).toBe('受注確定');

    const caseC = delayedCases.find((c) => c.id === 'deal-c')!;
    expect(caseC.name).toBe('商談C');
    expect(caseC.invoiceExpectedDate).toEqual(new Date('2024-01-14T00:00:00Z'));
    expect(caseC.overdueDays).toBe(1);
    expect(caseC.status).toBe('受注確定');
  });
});