import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { calculateROIAnalysis } from '../../src/logic/it-1-3';

describe('ROI試算・投資判断支援機能 - 3年間の累積削減額バリデーション', () => {
  let systemLogs: Array<{ timestamp: string; eventType: string; message: string }> = [];

  beforeEach(() => {
    systemLogs = [];
  });

  afterEach(() => {
    systemLogs = [];
  });

  // SCEN-322
  test('3年間の累積削減額がゼロ以下の場合、ROI試算は実行不可となり適切なエラーメッセージが表示される', () => {
    const initialInvestment = 500000;
    const annualReductionAmount = -50000;
    const analysisYears = 3;

    const mockLogger = (eventType: string, message: string) => {
      const timestamp = new Date('2024-01-15T11:00:00Z').toISOString();
      systemLogs.push({ timestamp, eventType, message });
    };

    // 年間削減額が負数のケース（3年間の累積削減額 = -50000 * 3 = -150000）
    expect(() => {
      calculateROIAnalysis({
        initialInvestment,
        annualReductionAmount,
        analysisYears,
        logger: mockLogger
      });
    }).toThrow(/投資効果/);

    // システムログに該当エラーイベントが記録されていることを確認
    expect(systemLogs.length).toBeGreaterThan(0);
    expect(systemLogs.some(log => log.eventType === 'ROI_CALCULATION_ERROR')).toBe(true);
    expect(systemLogs.some(log => log.message.includes('投資効果がないため'))).toBe(true);
  });

  test('3年間の累積削減額がゼロの場合、ROI試算は実行不可となり適切なエラーが発生する', () => {
    const initialInvestment = 500000;
    const annualReductionAmount = 0;
    const analysisYears = 3;

    const mockLogger = (eventType: string, message: string) => {
      const timestamp = new Date('2024-01-15T11:00:00Z').toISOString();
      systemLogs.push({ timestamp, eventType, message });
    };

    // 年間削減額が0のケース（3年間の累積削減額 = 0 * 3 = 0）
    expect(() => {
      calculateROIAnalysis({
        initialInvestment,
        annualReductionAmount,
        analysisYears,
        logger: mockLogger
      });
    }).toThrow(/投資効果/);

    expect(systemLogs.length).toBeGreaterThan(0);
    expect(systemLogs.some(log => log.eventType === 'ROI_CALCULATION_ERROR')).toBe(true);
  });

  test('3年間の累積削減額が正数の場合、ROI試算が正常に実行され具体的な数値が計算される', () => {
    const initialInvestment = 500000;
    const annualReductionAmount = 200000;
    const analysisYears = 3;

    const mockLogger = (eventType: string, message: string) => {
      const timestamp = new Date('2024-01-15T11:00:00Z').toISOString();
      systemLogs.push({ timestamp, eventType, message });
    };

    // 年間削減額が正数のケース（3年間の累積削減額 = 200000 * 3 = 600000）
    const result = calculateROIAnalysis({
      initialInvestment,
      annualReductionAmount,
      analysisYears,
      logger: mockLogger
    });

    // 3年間の累積削減額が初期投資を上回る場合、ROI試算が成功
    expect(result.cumulativeReductionAmount).toBe(600000);
    expect(result.roi).toBe(20); // (600000 - 500000) / 500000 * 100 = 20%
    expect(result.paybackPeriodYears).toBe(2.5); // 500000 / 200000 = 2.5年
    expect(result.isExecutable).toBe(true);

    // ログ記録
    expect(systemLogs.some(log => log.eventType === 'ROI_CALCULATION_SUCCESS')).toBe(true);
  });

  test('年間削減額が少額でも3年間の累積削減額が正数なら試算は実行可能', () => {
    const initialInvestment = 300000;
    const annualReductionAmount = 100000;
    const analysisYears = 3;

    const mockLogger = (eventType: string, message: string) => {
      const timestamp = new Date('2024-01-15T11:00:00Z').toISOString();
      systemLogs.push({ timestamp, eventType, message });
    };

    // 年間削減額が小さいが正数のケース（3年間の累積削減額 = 100000 * 3 = 300000）
    const result = calculateROIAnalysis({
      initialInvestment,
      annualReductionAmount,
      analysisYears,
      logger: mockLogger
    });

    expect(result.cumulativeReductionAmount).toBe(300000);
    expect(result.roi).toBe(0); // (300000 - 300000) / 300000 * 100 = 0%
    expect(result.isExecutable).toBe(true);
  });

  test('初期投資額より3年間の累積削減額が大きい場合、ROIが正の値で計算される', () => {
    const initialInvestment = 400000;
    const annualReductionAmount = 150000;
    const analysisYears = 3;

    const mockLogger = (eventType: string, message: string) => {
      systemLogs.push({
        timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
        eventType,
        message
      });
    };

    // 3年間の累積削減額 = 150000 * 3 = 450000 > 400000
    const result = calculateROIAnalysis({
      initialInvestment,
      annualReductionAmount,
      analysisYears,
      logger: mockLogger
    });

    expect(result.cumulativeReductionAmount).toBe(450000);
    expect(result.roi).toBe(12.5); // (450000 - 400000) / 400000 * 100 = 12.5%
    expect(result.paybackPeriodYears).toBeCloseTo(2.67, 1); // 400000 / 150000 ≈ 2.67年
    expect(result.isExecutable).toBe(true);
  });
});