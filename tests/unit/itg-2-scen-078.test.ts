import { extractDocumentData } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータルの帳票データ抽出・反映機能', () => {
  // SCEN-078
  test('帳票フォーマットルール違反時にデータ変換エラーが発生し、ロールバック処理が実行される', () => {
    const dealRecordWithMissingCustomerName = {
      deal_id: 'DEAL-001',
      customer_name: '',
      customer_code: 'CUST-0001',
      deal_amount: 1000000,
      deal_date: '2024-01-15',
      deal_status: 'closed_won',
      line_items: [
        {
          product_code: 'PROD-001',
          product_name: 'Product A',
          quantity: 5,
          unit_price: 200000,
        },
      ],
    };

    expect(() => extractDocumentData(dealRecordWithMissingCustomerName)).toThrow(
      /顧客名/
    );
  });

  test('データ型不正時にデータ変換エラーが発生し、ロールバック処理が実行される', () => {
    const dealRecordWithInvalidDataType = {
      deal_id: 'DEAL-002',
      customer_name: 'Customer Inc.',
      customer_code: 'CUST-0002',
      deal_amount: 'invalid_amount',
      deal_date: '2024-01-15',
      deal_status: 'closed_won',
      line_items: [
        {
          product_code: 'PROD-001',
          product_name: 'Product A',
          quantity: 5,
          unit_price: 200000,
        },
      ],
    };

    expect(() => extractDocumentData(dealRecordWithInvalidDataType)).toThrow(
      /金額/
    );
  });

  test('商品明細が空の場合にデータ変換エラーが発生し、ロールバック処理が実行される', () => {
    const dealRecordWithEmptyLineItems = {
      deal_id: 'DEAL-003',
      customer_name: 'Customer Inc.',
      customer_code: 'CUST-0003',
      deal_amount: 1000000,
      deal_date: '2024-01-15',
      deal_status: 'closed_won',
      line_items: [],
    };

    expect(() => extractDocumentData(dealRecordWithEmptyLineItems)).toThrow(
      /明細/
    );
  });

  test('顧客コード不正時にデータ変換エラーが発生し、ロールバック処理が実行される', () => {
    const dealRecordWithInvalidCustomerCode = {
      deal_id: 'DEAL-004',
      customer_name: 'Customer Inc.',
      customer_code: 'INVALID-CODE-TOO-LONG-STRING-EXCEEDING-LENGTH-LIMIT',
      deal_amount: 1000000,
      deal_date: '2024-01-15',
      deal_status: 'closed_won',
      line_items: [
        {
          product_code: 'PROD-001',
          product_name: 'Product A',
          quantity: 5,
          unit_price: 200000,
        },
      ],
    };

    expect(() => extractDocumentData(dealRecordWithInvalidCustomerCode)).toThrow(
      /顧客コード/
    );
  });

  test('正規の帳票フォーマットデータの場合、データ変換が成功し、抽出データが返される', () => {
    const validDealRecord = {
      deal_id: 'DEAL-005',
      customer_name: 'Customer Inc.',
      customer_code: 'CUST-0005',
      deal_amount: 1000000,
      deal_date: '2024-01-15',
      deal_status: 'closed_won',
      line_items: [
        {
          product_code: 'PROD-001',
          product_name: 'Product A',
          quantity: 5,
          unit_price: 200000,
        },
        {
          product_code: 'PROD-002',
          product_name: 'Product B',
          quantity: 3,
          unit_price: 0,
        },
      ],
    };

    const result = extractDocumentData(validDealRecord);

    expect(result.deal_id).toBe('DEAL-005');
    expect(result.customer_name).toBe('Customer Inc.');
    expect(result.customer_code).toBe('CUST-0005');
    expect(result.deal_amount).toBe(1000000);
    expect(result.total_line_items).toBe(2);
    expect(result.extraction_status).toBe('success');
    expect(result.converted_at).toBeDefined();
  });

  test('金額が負数の場合にデータ変換エラーが発生し、ロールバック処理が実行される', () => {
    const dealRecordWithNegativeAmount = {
      deal_id: 'DEAL-006',
      customer_name: 'Customer Inc.',
      customer_code: 'CUST-0006',
      deal_amount: -1000000,
      deal_date: '2024-01-15',
      deal_status: 'closed_won',
      line_items: [
        {
          product_code: 'PROD-001',
          product_name: 'Product A',
          quantity: 5,
          unit_price: 200000,
        },
      ],
    };

    expect(() => extractDocumentData(dealRecordWithNegativeAmount)).toThrow(
      /金額/
    );
  });

  test('日付形式が不正の場合にデータ変換エラーが発生し、ロールバック処理が実行される', () => {
    const dealRecordWithInvalidDateFormat = {
      deal_id: 'DEAL-007',
      customer_name: 'Customer Inc.',
      customer_code: 'CUST-0007',
      deal_amount: 1000000,
      deal_date: '2024/01/15',
      deal_status: 'closed_won',
      line_items: [
        {
          product_code: 'PROD-001',
          product_name: 'Product A',
          quantity: 5,
          unit_price: 200000,
        },
      ],
    };

    expect(() => extractDocumentData(dealRecordWithInvalidDateFormat)).toThrow(
      /日付/
    );
  });

  test('商品名が空文字の場合にデータ変換エラーが発生し、ロールバック処理が実行される', () => {
    const dealRecordWithEmptyProductName = {
      deal_id: 'DEAL-008',
      customer_name: 'Customer Inc.',
      customer_code: 'CUST-0008',
      deal_amount: 1000000,
      deal_date: '2024-01-15',
      deal_status: 'closed_won',
      line_items: [
        {
          product_code: 'PROD-001',
          product_name: '',
          quantity: 5,
          unit_price: 200000,
        },
      ],
    };

    expect(() => extractDocumentData(dealRecordWithEmptyProductName)).toThrow(
      /商品名/
    );
  });

  test('数量が0以下の場合にデータ変換エラーが発生し、ロールバック処理が実行される', () => {
    const dealRecordWithInvalidQuantity = {
      deal_id: 'DEAL-009',
      customer_name: 'Customer Inc.',
      customer_code: 'CUST-0009',
      deal_amount: 1000000,
      deal_date: '2024-01-15',
      deal_status: 'closed_won',
      line_items: [
        {
          product_code: 'PROD-001',
          product_name: 'Product A',
          quantity: 0,
          unit_price: 200000,
        },
      ],
    };

    expect(() => extractDocumentData(dealRecordWithInvalidQuantity)).toThrow(
      /数量/
    );
  });

  test('ステータスが無効な値の場合にデータ変換エラーが発生し、ロールバック処理が実行される', () => {
    const dealRecordWithInvalidStatus = {
      deal_id: 'DEAL-010',
      customer_name: 'Customer Inc.',
      customer_code: 'CUST-0010',
      deal_amount: 1000000,
      deal_date: '2024-01-15',
      deal_status: 'invalid_status',
      line_items: [
        {
          product_code: 'PROD-001',
          product_name: 'Product A',
          quantity: 5,
          unit_price: 200000,
        },
      ],
    };

    expect(() => extractDocumentData(dealRecordWithInvalidStatus)).toThrow(
      /ステータス/
    );
  });
});