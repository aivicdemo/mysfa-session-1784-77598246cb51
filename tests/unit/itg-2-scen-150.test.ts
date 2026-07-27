import { deleteDocument } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-150
  test('[normal] Google Drive API連携 - deleteDocumentが成功応答を返した場合、不要な文書がストレージから削除される', async () => {
    const document_id = 'doc_12345_expired_quote';
    const document_storage_mock = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn().mockResolvedValue({
        status: 204,
        message: 'Document deleted successfully',
      }),
    };

    const internal_cache_mock: Record<string, boolean> = {
      [document_id]: true,
    };

    const result = await deleteDocument(
      document_id,
      document_storage_mock,
      internal_cache_mock
    );

    expect(document_storage_mock.deleteDocument).toHaveBeenCalledWith(
      document_id
    );
    expect(document_storage_mock.deleteDocument).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: true,
      message: 'Document deleted from storage',
    });
    expect(internal_cache_mock[document_id]).toBeUndefined();
  });
});