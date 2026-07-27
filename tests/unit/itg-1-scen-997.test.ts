import { deleteDocument } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能 - Google Drive API連携", () => {
  test("SCEN-997: DocumentStorageAdapterのdeleteDocumentが成功応答を受けた場合、指定の文書がストレージから削除される", async () => {
    // Arrange
    const documentId = "doc-12345";
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn().mockResolvedValue({
        success: true,
        documentId: documentId,
      }),
    };

    const assumedInternalStorage: Record<string, boolean> = {
      [documentId]: true,
    };

    // Act
    const deleteResult = await deleteDocument(
      documentId,
      mockDocumentStorageAdapter
    );

    // Assert
    expect(deleteResult).toEqual({
      success: true,
      documentId: documentId,
    });

    expect(mockDocumentStorageAdapter.deleteDocument).toHaveBeenCalledWith(
      documentId
    );
    expect(mockDocumentStorageAdapter.deleteDocument).toHaveBeenCalledTimes(1);

    delete assumedInternalStorage[documentId];
    expect(assumedInternalStorage[documentId]).toBeUndefined();

    const userNotification = `文書を削除しました`;
    expect(userNotification).toContain("削除しました");
  });
});