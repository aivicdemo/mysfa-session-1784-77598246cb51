import { validateInvoiceAmount } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-253
  test('顧客請求内容検証機能 - 請求金額が期待値から許容範囲を超えて乖離する場合に異常フラグが立てられ営業に通知される', () => {
    // ハッピーパス: 許容範囲内の請求金額
    const validInvoice = {
      customerId: 'CUST-001',
      customerName: '株式会社A',
      expectedAmount: 100000,
      actualAmount: 105000,
      tolerancePercentage: 10,
    };
    const validResult = validateInvoiceAmount(validInvoice);
    expect(validResult).toEqual({
      isAnomalous: false,
      flagSet: false,
      notificationRequired: false,
      deviationAmount: 5000,
      deviationPercentage: 5,
    });

    // 許容範囲下限境界値: 期待値の90%(許容範囲内)
    const boundaryLowerInvoice = {
      customerId: 'CUST-002',
      customerName: '株式会社B',
      expectedAmount: 100000,
      actualAmount: 90000,
      tolerancePercentage: 10,
    };
    const boundaryLowerResult = validateInvoiceAmount(boundaryLowerInvoice);
    expect(boundaryLowerResult).toEqual({
      isAnomalous: false,
      flagSet: false,
      notificationRequired: false,
      deviationAmount: -10000,
      deviationPercentage: -10,
    });

    // 許容範囲上限境界値: 期待値の110%(許容範囲内)
    const boundaryUpperInvoice = {
      customerId: 'CUST-003',
      customerName: '株式会社C',
      expectedAmount: 100000,
      actualAmount: 110000,
      tolerancePercentage: 10,
    };
    const boundaryUpperResult = validateInvoiceAmount(boundaryUpperInvoice);
    expect(boundaryUpperResult).toEqual({
      isAnomalous: false,
      flagSet: false,
      notificationRequired: false,
      deviationAmount: 10000,
      deviationPercentage: 10,
    });

    // エラーケース: 許容範囲を超える高額(150,000円)
    const excessiveHighInvoice = {
      customerId: 'CUST-004',
      customerName: '株式会社D',
      expectedAmount: 100000,
      actualAmount: 150000,
      tolerancePercentage: 10,
    };
    const excessiveHighResult = validateInvoiceAmount(excessiveHighInvoice);
    expect(excessiveHighResult).toEqual({
      isAnomalous: true,
      flagSet: true,
      notificationRequired: true,
      deviationAmount: 50000,
      deviationPercentage: 50,
      notificationDetails: {
        customerName: '株式会社D',
        invoiceAmount: 150000,
        expectedAmount: 100000,
        deviationAmount: 50000,
        severity: 'HIGH',
      },
    });

    // エラーケース: 許容範囲を超える低額(50,000円)
    const excessiveLowInvoice = {
      customerId: 'CUST-005',
      customerName: '株式会社E',
      expectedAmount: 100000,
      actualAmount: 50000,
      tolerancePercentage: 10,
    };
    const excessiveLowResult = validateInvoiceAmount(excessiveLowInvoice);
    expect(excessiveLowResult).toEqual({
      isAnomalous: true,
      flagSet: true,
      notificationRequired: true,
      deviationAmount: -50000,
      deviationPercentage: -50,
      notificationDetails: {
        customerName: '株式会社E',
        invoiceAmount: 50000,
        expectedAmount: 100000,
        deviationAmount: -50000,
        severity: 'HIGH',
      },
    });

    // エラーケース: 許容範囲ぎりぎり越える(89,999円 = -10.001%)
    const justBelowLowerBoundary = {
      customerId: 'CUST-006',
      customerName: '株式会社F',
      expectedAmount: 100000,
      actualAmount: 89999,
      tolerancePercentage: 10,
    };
    const justBelowResult = validateInvoiceAmount(justBelowLowerBoundary);
    expect(justBelowResult).toEqual({
      isAnomalous: true,
      flagSet: true,
      notificationRequired: true,
      deviationAmount: -10001,
      deviationPercentage: -10.001,
      notificationDetails: {
        customerName: '株式会社F',
        invoiceAmount: 89999,
        expectedAmount: 100000,
        deviationAmount: -10001,
        severity: 'MEDIUM',
      },
    });

    // エラーケース: 許容範囲ぎりぎり越える(110,001円 = +10.001%)
    const justAboveUpperBoundary = {
      customerId: 'CUST-007',
      customerName: '株式会社G',
      expectedAmount: 100000,
      actualAmount: 110001,
      tolerancePercentage: 10,
    };
    const justAboveResult = validateInvoiceAmount(justAboveUpperBoundary);
    expect(justAboveResult).toEqual({
      isAnomalous: true,
      flagSet: true,
      notificationRequired: true,
      deviationAmount: 10001,
      deviationPercentage: 10.001,
      notificationDetails: {
        customerName: '株式会社G',
        invoiceAmount: 110001,
        expectedAmount: 100000,
        deviationAmount: 10001,
        severity: 'MEDIUM',
      },
    });

    // エラーケース: 無効な入力(期待金額が0)
    expect(() => {
      validateInvoiceAmount({
        customerId: 'CUST-008',
        customerName: '株式会社H',
        expectedAmount: 0,
        actualAmount: 100000,
        tolerancePercentage: 10,
      });
    }).toThrow(/期待金額/);

    // エラーケース: 無効な入力(許容範囲がマイナス)
    expect(() => {
      validateInvoiceAmount({
        customerId: 'CUST-009',
        customerName: '株式会社I',
        expectedAmount: 100000,
        actualAmount: 150000,
        tolerancePercentage: -5,
      });
    }).toThrow(/許容範囲/);

    // エラーケース: 顧客名が空
    expect(() => {
      validateInvoiceAmount({
        customerId: 'CUST-010',
        customerName: '',
        expectedAmount: 100000,
        actualAmount: 105000,
        tolerancePercentage: 10,
      });
    }).toThrow(/顧客名/);
  });
});