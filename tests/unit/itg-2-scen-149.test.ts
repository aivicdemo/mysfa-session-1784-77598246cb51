import { generateShareLink } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  test("SCEN-149: Google Drive API連携 - generateShareLinkが成功応答を返した場合、一時的にアクセス可能な共有リンクが顧客に提供される", async () => {
    // 準備: DocumentStorageAdapterのスタブを設定
    const assumed_expiry_timestamp_ms = Date.now() + 24 * 60 * 60 * 1000; // 24時間後
    const assumed_share_link_url = "https://drive.google.com/file/d/assumed-file-id/view?usp=sharing";
    const assumed_access_permission = "VIEW_ONLY_WITH_EXPIRY";

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn().mockResolvedValue({
        shareUrl: assumed_share_link_url,
        expiryTimestamp: assumed_expiry_timestamp_ms,
        accessPermission: assumed_access_permission,
      }),
      deleteDocument: jest.fn(),
    };

    const assumed_document_id = "assumed-doc-12345";
    const assumed_customer_user_id = "customer-user-001";

    // 実行: 共有リンク生成関数を呼び出し
    const result = await generateShareLink(
      assumed_document_id,
      assumed_customer_user_id,
      mockDocumentStorageAdapter
    );

    // 検証1: generateShareLinkメソッドが呼び出されたことを確認
    expect(mockDocumentStorageAdapter.generateShareLink).toHaveBeenCalledWith(
      assumed_document_id,
      assumed_customer_user_id
    );

    // 検証2: 返却された共有リンクURLが正しいことを確認
    expect(result.shareUrl).toBe(assumed_share_link_url);

    // 検証3: 有効期限が24時間以内に設定されていることを確認
    const current_timestamp_ms = Date.now();
    const validity_period_ms = result.expiryTimestamp - current_timestamp_ms;
    const max_validity_period_ms = 24 * 60 * 60 * 1000; // 24時間
    expect(validity_period_ms).toBeLessThanOrEqual(max_validity_period_ms);
    expect(validity_period_ms).toBeGreaterThan(0);

    // 検証4: アクセス権限が「閲覧のみ」または「期限付きアクセス」として制限されていることを確認
    expect(result.accessPermission).toMatch(/VIEW_ONLY|EXPIRY/);

    // 検証5: 期待される有効期限タイムスタンプが返却されていることを確認
    expect(result.expiryTimestamp).toBe(assumed_expiry_timestamp_ms);
  });
});