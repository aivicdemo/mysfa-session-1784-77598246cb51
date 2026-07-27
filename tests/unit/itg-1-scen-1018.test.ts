import { fetchEditionDetails } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-1018: Salesforce Metadata API連携 - fetchEditionDetailsが成功応答を受けた場合、各エディションの契約数・利用数・機能一覧が取得される', async () => {
    // Arrange: SalesforceMetadataDataSourceのfetchEditionDetailsメソッドをスタブ化
    const mockSalesforceMetadataDataSource = {
      fetchEditionDetails: jest.fn().mockResolvedValue({
        editions: [
          {
            editionName: 'Salesforce Professional',
            contractCount: 30,
            usageCount: 28,
            features: ['API呼び出し', 'ストレージ', '基本自動化']
          },
          {
            editionName: 'Salesforce Enterprise',
            contractCount: 50,
            usageCount: 48,
            features: ['API呼び出し', 'ストレージ', '自動化', 'カスタマイズ']
          },
          {
            editionName: 'Lightning Platform',
            contractCount: 20,
            usageCount: 15,
            features: ['API呼び出し', 'ストレージ', 'Apex開発', '自動化']
          }
        ]
      })
    };

    // Act: fetchEditionDetailsメソッドを呼び出す
    const response = await fetchEditionDetails(mockSalesforceMetadataDataSource);

    // Assert: レスポンスオブジェクトを検証
    expect(response).toBeDefined();
    expect(response.editions).toBeDefined();
    expect(Array.isArray(response.editions)).toBe(true);
    expect(response.editions.length).toBe(3);

    // 各エディションについて詳細検証
    response.editions.forEach((edition: any) => {
      // （1）契約数が正の整数であることを確認
      expect(typeof edition.contractCount).toBe('number');
      expect(Number.isInteger(edition.contractCount)).toBe(true);
      expect(edition.contractCount).toBeGreaterThan(0);

      // （2）利用数が0以上の整数かつ契約数以下であることを確認
      expect(typeof edition.usageCount).toBe('number');
      expect(Number.isInteger(edition.usageCount)).toBe(true);
      expect(edition.usageCount).toBeGreaterThanOrEqual(0);
      expect(edition.usageCount).toBeLessThanOrEqual(edition.contractCount);

      // （3）機能一覧が配列形式で、各要素が文字列であることを確認
      expect(Array.isArray(edition.features)).toBe(true);
      expect(edition.features.length).toBeGreaterThan(0);
      edition.features.forEach((feature: any) => {
        expect(typeof feature).toBe('string');
        expect(feature.length).toBeGreaterThan(0);
      });

      // エディション名が定義されていることを確認
      expect(typeof edition.editionName).toBe('string');
      expect(edition.editionName.length).toBeGreaterThan(0);
    });

    // 具体的なデータ値の検証
    const salesforceEnterprise = response.editions.find(
      (e: any) => e.editionName === 'Salesforce Enterprise'
    );
    expect(salesforceEnterprise.contractCount).toBe(50);
    expect(salesforceEnterprise.usageCount).toBe(48);
    expect(salesforceEnterprise.features).toContain('API呼び出し');
    expect(salesforceEnterprise.features).toContain('ストレージ');
    expect(salesforceEnterprise.features).toContain('自動化');
    expect(salesforceEnterprise.features.length).toBe(4);

    const lightningPlatform = response.editions.find(
      (e: any) => e.editionName === 'Lightning Platform'
    );
    expect(lightningPlatform.contractCount).toBe(20);
    expect(lightningPlatform.usageCount).toBe(15);
    expect(lightningPlatform.features).toContain('Apex開発');

    // スタブが正確に呼び出されたことを確認
    expect(mockSalesforceMetadataDataSource.fetchEditionDetails).toHaveBeenCalledTimes(1);
  });
});