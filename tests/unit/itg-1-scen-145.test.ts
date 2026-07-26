import { validateCustomerInfoAndGenerateDocuments } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-145
  test('顧客情報の必須項目が空白の場合、警告が表示される', () => {
    const deal_id = 'DEAL-2024-001';
    const customer_info_empty_name = {
      customer_name: '',
      address: '東京都渋谷区1-1-1',
      phone_number: '03-1234-5678',
      email_address: 'customer@example.com',
    };

    expect(() =>
      validateCustomerInfoAndGenerateDocuments(deal_id, customer_info_empty_name)
    ).toThrow(/顧客名/);
  });

  test('顧客情報の住所が空白の場合、警告が表示される', () => {
    const deal_id = 'DEAL-2024-002';
    const customer_info_empty_address = {
      customer_name: '株式会社ABC',
      address: '',
      phone_number: '03-1234-5678',
      email_address: 'customer@example.com',
    };

    expect(() =>
      validateCustomerInfoAndGenerateDocuments(deal_id, customer_info_empty_address)
    ).toThrow(/住所/);
  });

  test('顧客情報の電話番号が空白の場合、警告が表示される', () => {
    const deal_id = 'DEAL-2024-003';
    const customer_info_empty_phone = {
      customer_name: '株式会社ABC',
      address: '東京都渋谷区1-1-1',
      phone_number: '',
      email_address: 'customer@example.com',
    };

    expect(() =>
      validateCustomerInfoAndGenerateDocuments(deal_id, customer_info_empty_phone)
    ).toThrow(/電話番号/);
  });

  test('顧客情報のメールアドレスが空白の場合、警告が表示される', () => {
    const deal_id = 'DEAL-2024-004';
    const customer_info_empty_email = {
      customer_name: '株式会社ABC',
      address: '東京都渋谷区1-1-1',
      phone_number: '03-1234-5678',
      email_address: '',
    };

    expect(() =>
      validateCustomerInfoAndGenerateDocuments(deal_id, customer_info_empty_email)
    ).toThrow(/メールアドレス/);
  });

  test('顧客情報がすべて入力されている場合、自動生成が成功する', () => {
    const deal_id = 'DEAL-2024-005';
    const customer_info_complete = {
      customer_name: '株式会社ABC',
      address: '東京都渋谷区1-1-1',
      phone_number: '03-1234-5678',
      email_address: 'customer@example.com',
    };

    const result = validateCustomerInfoAndGenerateDocuments(
      deal_id,
      customer_info_complete
    );

    expect(result).toEqual({
      success: true,
      deal_id: 'DEAL-2024-005',
      generated_documents: {
        quotation: expect.any(Object),
        order: expect.any(Object),
        invoice: expect.any(Object),
      },
    });
  });
});