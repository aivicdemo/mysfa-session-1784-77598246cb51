import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { generateMonthlyRevenueReport } from '../../src/logic/it-1-3';

interface DealRecord {
  dealId: string;
  customerName: string;
  amount: number;
  registeredDate: Date;
}

interface MonthlyRevenueReport {
  period: string;
  totalRevenue: number;
  dealDetails: Array<{
    dealId: string;
    customerName: string;
    amount: number;
    registeredDate: string;
  }>;
}

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  let mockDatabase: DealRecord[];

  beforeEach(() => {
    mockDatabase = [];
  });

  afterEach(() => {
    mockDatabase = [];
  });

  // SCEN-330
  test('対象期間内に重複する商談レコードが存在するとき、重複をそのまま集計に含める', () => {
    const targetPeriodStart = new Date('2024-01-01T00:00:00Z');
    const targetPeriodEnd = new Date('2024-01-31T23:59:59Z');

    const dealRecord1: DealRecord = {
      dealId: 'DEAL-001',
      customerName: 'A社',
      amount: 1000000,
      registeredDate: new Date('2024-01-10T09:00:00Z'),
    };

    const dealRecord2: DealRecord = {
      dealId: 'DEAL-001',
      customerName: 'A社',
      amount: 1000000,
      registeredDate: new Date('2024-01-15T10:00:00Z'),
    };

    const dealRecord3: DealRecord = {
      dealId: 'DEAL-001',
      customerName: 'A社',
      amount: 1000000,
      registeredDate: new Date('2024-01-20T11:00:00Z'),
    };

    mockDatabase.push(dealRecord1);
    mockDatabase.push(dealRecord2);
    mockDatabase.push(dealRecord3);

    const report: MonthlyRevenueReport = generateMonthlyRevenueReport(
      mockDatabase,
      targetPeriodStart,
      targetPeriodEnd
    );

    expect(report.totalRevenue).toBe(3000000);
    expect(report.dealDetails).toHaveLength(3);
    expect(report.dealDetails[0]).toEqual({
      dealId: 'DEAL-001',
      customerName: 'A社',
      amount: 1000000,
      registeredDate: '2024-01-10T09:00:00Z',
    });
    expect(report.dealDetails[1]).toEqual({
      dealId: 'DEAL-001',
      customerName: 'A社',
      amount: 1000000,
      registeredDate: '2024-01-15T10:00:00Z',
    });
    expect(report.dealDetails[2]).toEqual({
      dealId: 'DEAL-001',
      customerName: 'A社',
      amount: 1000000,
      registeredDate: '2024-01-20T11:00:00Z',
    });
  });
});