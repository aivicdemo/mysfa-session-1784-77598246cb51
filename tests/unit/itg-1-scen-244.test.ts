import { validateQuotationData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-244
  test('請求対象データ妥当性検証機能 - 商談成約データの必須項目が全て完全で金額が妥当な場合に承認される', () => {
    const deal_id = 'DEAL-20240415-001';
    const customer_name = '株式会社A商社';
    const product_name = 'クラウドシステム導入パッケージ';
    const agreement_date = '2024-04-15';
    const agreement_amount = 2500000;
    const sales_owner = '営業太郎';

    const input = {
      deal_id,
      customer_name,
      product_name,
      agreement_date,
      agreement_amount,
      sales_owner,
    };

    const result = validateQuotationData(input);

    expect(result.is_valid).toBe(true);
    expect(result.status).toBe('承認');
    expect(result.message).toMatch(/承認/);
    expect(result.deal_id).toBe(deal_id);
    expect(result.validation_result).toEqual({
      has_all_required_fields: true,
      amount_in_valid_range: true,
      amount_min: 100000,
      amount_max: 50000000,
      validated_amount: agreement_amount,
    });
  });

  test('請求対象データ妥当性検証機能 - 必須項目が不足している場合に却下される', () => {
    const input = {
      deal_id: 'DEAL-20240415-002',
      customer_name: '株式会社B商社',
      product_name: '',
      agreement_date: '2024-04-15',
      agreement_amount: 2500000,
      sales_owner: '営業太郎',
    };

    expect(() => validateQuotationData(input)).toThrow(/必須項目/);
  });

  test('請求対象データ妥当性検証機能 - 成約金額が最小値未満の場合に却下される', () => {
    const input = {
      deal_id: 'DEAL-20240415-003',
      customer_name: '株式会社C商社',
      product_name: 'サービス提供',
      agreement_date: '2024-04-15',
      agreement_amount: 50000,
      sales_owner: '営業太郎',
    };

    expect(() => validateQuotationData(input)).toThrow(/金額/);
  });

  test('請求対象データ妥当性検証機能 - 成約金額が最大値を超える場合に却下される', () => {
    const input = {
      deal_id: 'DEAL-20240415-004',
      customer_name: '株式会社D商社',
      product_name: 'エンタープライズシステム',
      agreement_date: '2024-04-15',
      agreement_amount: 75000000,
      sales_owner: '営業太郎',
    };

    expect(() => validateQuotationData(input)).toThrow(/金額/);
  });

  test('請求対象データ妥当性検証機能 - 成約日付がISO形式でない場合に却下される', () => {
    const input = {
      deal_id: 'DEAL-20240415-005',
      customer_name: '株式会社E商社',
      product_name: 'コンサルティング',
      agreement_date: '2024/04/15',
      agreement_amount: 3000000,
      sales_owner: '営業太郎',
    };

    expect(() => validateQuotationData(input)).toThrow(/日付/);
  });

  test('請求対象データ妥当性検証機能 - 複数の必須項目が不足している場合に却下される', () => {
    const input = {
      deal_id: '',
      customer_name: '',
      product_name: '',
      agreement_date: '2024-04-15',
      agreement_amount: 2500000,
      sales_owner: '',
    };

    expect(() => validateQuotationData(input)).toThrow(/必須項目/);
  });

  test('請求対象データ妥当性検証機能 - 成約金額が正確に最小値である場合に承認される', () => {
    const input = {
      deal_id: 'DEAL-20240415-006',
      customer_name: '株式会社F商社',
      product_name: 'サポートサービス',
      agreement_date: '2024-04-15',
      agreement_amount: 100000,
      sales_owner: '営業太郎',
    };

    const result = validateQuotationData(input);

    expect(result.is_valid).toBe(true);
    expect(result.status).toBe('承認');
    expect(result.validation_result.amount_in_valid_range).toBe(true);
    expect(result.validation_result.validated_amount).toBe(100000);
  });

  test('請求対象データ妥当性検証機能 - 成約金額が正確に最大値である場合に承認される', () => {
    const input = {
      deal_id: 'DEAL-20240415-007',
      customer_name: '株式会社G商社',
      product_name: 'フルスケール導入',
      agreement_date: '2024-04-15',
      agreement_amount: 50000000,
      sales_owner: '営業太郎',
    };

    const result = validateQuotationData(input);

    expect(result.is_valid).toBe(true);
    expect(result.status).toBe('承認');
    expect(result.validation_result.amount_in_valid_range).toBe(true);
    expect(result.validation_result.validated_amount).toBe(50000000);
  });
});