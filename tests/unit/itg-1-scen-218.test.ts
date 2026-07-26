import { generateInvoiceFromDeal } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-218
  test('複数行の明細（10行以上）がすべて請求書に正しく反映される', () => {
    const dealData = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      customer_name: '株式会社テスト',
      status: '成約',
      line_items: [
        {
          line_id: 'LINE-001',
          product_name: '商品A',
          quantity: 10,
          unit_price: 1000,
          tax_rate: 0.1,
          line_order: 1,
        },
        {
          line_id: 'LINE-002',
          product_name: '商品B',
          quantity: 5,
          unit_price: 2000,
          tax_rate: 0.1,
          line_order: 2,
        },
        {
          line_id: 'LINE-003',
          product_name: '商品C',
          quantity: 3,
          unit_price: 5000,
          tax_rate: 0.08,
          line_order: 3,
        },
        {
          line_id: 'LINE-004',
          product_name: '商品D',
          quantity: 8,
          unit_price: 1500,
          tax_rate: 0.1,
          line_order: 4,
        },
        {
          line_id: 'LINE-005',
          product_name: '商品E',
          quantity: 2,
          unit_price: 10000,
          tax_rate: 0.1,
          line_order: 5,
        },
        {
          line_id: 'LINE-006',
          product_name: '商品F',
          quantity: 15,
          unit_price: 500,
          tax_rate: 0.08,
          line_order: 6,
        },
        {
          line_id: 'LINE-007',
          product_name: '商品G',
          quantity: 7,
          unit_price: 3000,
          tax_rate: 0.1,
          line_order: 7,
        },
        {
          line_id: 'LINE-008',
          product_name: '商品H',
          quantity: 4,
          unit_price: 2500,
          tax_rate: 0.1,
          line_order: 8,
        },
        {
          line_id: 'LINE-009',
          product_name: '商品I',
          quantity: 6,
          unit_price: 1200,
          tax_rate: 0.08,
          line_order: 9,
        },
        {
          line_id: 'LINE-010',
          product_name: '商品J',
          quantity: 9,
          unit_price: 800,
          tax_rate: 0.1,
          line_order: 10,
        },
        {
          line_id: 'LINE-011',
          product_name: '商品K',
          quantity: 12,
          unit_price: 600,
          tax_rate: 0.1,
          line_order: 11,
        },
      ],
    };

    const result = generateInvoiceFromDeal(dealData);

    // 明細行数が11行であることを確認
    expect(result.invoice_line_items.length).toBe(11);

    // 各明細行が正しく反映されていることを確認
    const line_001 = result.invoice_line_items.find((item) => item.line_id === 'LINE-001');
    expect(line_001).toEqual({
      line_id: 'LINE-001',
      product_name: '商品A',
      quantity: 10,
      unit_price: 1000,
      subtotal: 10000,
      tax_amount: 1000,
      total: 11000,
      tax_rate: 0.1,
      line_order: 1,
    });

    const line_003 = result.invoice_line_items.find((item) => item.line_id === 'LINE-003');
    expect(line_003).toEqual({
      line_id: 'LINE-003',
      product_name: '商品C',
      quantity: 3,
      unit_price: 5000,
      subtotal: 15000,
      tax_amount: 1200,
      total: 16200,
      tax_rate: 0.08,
      line_order: 3,
    });

    const line_011 = result.invoice_line_items.find((item) => item.line_id === 'LINE-011');
    expect(line_011).toEqual({
      line_id: 'LINE-011',
      product_name: '商品K',
      quantity: 12,
      unit_price: 600,
      subtotal: 7200,
      tax_amount: 720,
      total: 7920,
      tax_rate: 0.1,
      line_order: 11,
    });

    // 合計金額の計算検証
    // 小計: (10*1000) + (5*2000) + (3*5000) + (8*1500) + (2*10000) + (15*500) + (7*3000) + (4*2500) + (6*1200) + (9*800) + (12*600)
    //     = 10000 + 10000 + 15000 + 12000 + 20000 + 7500 + 21000 + 10000 + 7200 + 7200 + 7200
    //     = 127100
    // 税金: (10000*0.1) + (10000*0.1) + (15000*0.08) + (12000*0.1) + (20000*0.1) + (7500*0.08) + (21000*0.1) + (10000*0.1) + (7200*0.08) + (7200*0.1) + (7200*0.1)
    //     = 1000 + 1000 + 1200 + 1200 + 2000 + 600 + 2100 + 1000 + 576 + 720 + 720
    //     = 12016
    // 合計: 127100 + 12016 = 139116
    expect(result.subtotal).toBe(127100);
    expect(result.tax_amount).toBe(12016);
    expect(result.total_amount).toBe(139116);

    // 明細行の順序が保持されていることを確認
    for (let i = 0; i < result.invoice_line_items.length; i++) {
      expect(result.invoice_line_items[i].line_order).toBe(i + 1);
    }

    // 請求書の基本情報が正しく設定されていることを確認
    expect(result.invoice_id).toBeDefined();
    expect(result.customer_id).toBe('CUST-001');
    expect(result.customer_name).toBe('株式会社テスト');
    expect(result.deal_id).toBe('DEAL-001');
    expect(result.status).toBe('成約');
  });
});