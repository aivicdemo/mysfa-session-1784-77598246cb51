import { validateDocumentAmount } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-149
  test('帳票の金額合計が明細行の単価×数量の合計と一致しない場合、検証結果がエラーと判定される', () => {
    const documentData = {
      totalAmount: 10000,
      lineItems: [
        {
          unitPrice: 1000,
          quantity: 5,
        },
        {
          unitPrice: 2000,
          quantity: 2,
        },
      ],
    };

    const result = validateDocumentAmount(documentData);

    expect(result.status).toBe('error');
    expect(result.actualLineItemTotal).toBe(9000);
    expect(result.reportedTotal).toBe(10000);
    expect(result.discrepancy).toBe(1000);
    expect(result.message).toMatch(/金額合計/);
  });

  test('帳票の金額合計が明細行の単価×数量の合計と一致する場合、検証結果がOKと判定される', () => {
    const documentData = {
      totalAmount: 9000,
      lineItems: [
        {
          unitPrice: 1000,
          quantity: 5,
        },
        {
          unitPrice: 2000,
          quantity: 2,
        },
      ],
    };

    const result = validateDocumentAmount(documentData);

    expect(result.status).toBe('ok');
    expect(result.actualLineItemTotal).toBe(9000);
    expect(result.reportedTotal).toBe(9000);
    expect(result.discrepancy).toBe(0);
  });

  test('明細行が空の場合、検証結果が警告と判定される', () => {
    const documentData = {
      totalAmount: 0,
      lineItems: [],
    };

    const result = validateDocumentAmount(documentData);

    expect(result.status).toBe('warning');
    expect(result.message).toMatch(/明細/);
  });

  test('明細行数が異常に多い場合、検証結果が警告と判定される', () => {
    const manyLineItems = Array.from({ length: 1001 }, () => ({
      unitPrice: 100,
      quantity: 1,
    }));

    const documentData = {
      totalAmount: 100100,
      lineItems: manyLineItems,
    };

    const result = validateDocumentAmount(documentData);

    expect(result.status).toBe('warning');
    expect(result.message).toMatch(/行数/);
  });

  test('金額が負の値の場合、エラーがスローされる', () => {
    const documentData = {
      totalAmount: -1000,
      lineItems: [
        {
          unitPrice: 1000,
          quantity: 1,
        },
      ],
    };

    expect(() => validateDocumentAmount(documentData)).toThrow(/金額/);
  });

  test('単価が負の値の場合、エラーがスローされる', () => {
    const documentData = {
      totalAmount: 1000,
      lineItems: [
        {
          unitPrice: -100,
          quantity: 10,
        },
      ],
    };

    expect(() => validateDocumentAmount(documentData)).toThrow(/単価/);
  });

  test('数量が負の値の場合、エラーがスローされる', () => {
    const documentData = {
      totalAmount: 1000,
      lineItems: [
        {
          unitPrice: 100,
          quantity: -10,
        },
      ],
    };

    expect(() => validateDocumentAmount(documentData)).toThrow(/数量/);
  });
});