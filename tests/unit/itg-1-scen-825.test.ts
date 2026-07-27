import { validateBillingTargetData } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-825: 既に請求書が発行済みの商談データが含まれるとき、該当データを不承認と判定する", () => {
    // Mock DocumentStorageAdapter
    const documentStorageAdapterStub = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
      getExistingInvoiceForDeal: jest.fn((dealId: string) => {
        // DEAL-001 と DEAL-003 は請求書発行済み
        if (dealId === "DEAL-001" || dealId === "DEAL-003") {
          return {
            invoiceId: `INV-${dealId}`,
            issuedDate: "2024-01-15T10:00:00Z",
            dealId: dealId,
          };
        }
        // DEAL-002 は請求書未発行
        return null;
      }),
    };

    // 検証対象の商談データセット
    const dealDataSet = [
      {
        dealId: "DEAL-001",
        customerName: "顧客A",
        amount: 100000,
        status: "成約",
      },
      {
        dealId: "DEAL-002",
        customerName: "顧客B",
        amount: 50000,
        status: "成約",
      },
      {
        dealId: "DEAL-003",
        customerName: "顧客C",
        amount: 75000,
        status: "成約",
      },
    ];

    // 妥当性検証機能を実行
    const validationResult = validateBillingTargetData(
      dealDataSet,
      documentStorageAdapterStub
    );

    // 検証結果の確認
    expect(validationResult).toEqual({
      results: [
        {
          dealId: "DEAL-001",
          isApproved: false,
          rejectionReason: "既に請求書が発行済みです",
          errorCode: "INVOICE_ALREADY_ISSUED",
        },
        {
          dealId: "DEAL-002",
          isApproved: true,
          rejectionReason: null,
          errorCode: null,
        },
        {
          dealId: "DEAL-003",
          isApproved: false,
          rejectionReason: "既に請求書が発行済みです",
          errorCode: "INVOICE_ALREADY_ISSUED",
        },
      ],
      totalDeals: 3,
      approvedCount: 1,
      rejectedCount: 2,
    });

    // スタブが正しく呼び出されたことを確認
    expect(documentStorageAdapterStub.getExistingInvoiceForDeal).toHaveBeenCalledWith(
      "DEAL-001"
    );
    expect(documentStorageAdapterStub.getExistingInvoiceForDeal).toHaveBeenCalledWith(
      "DEAL-002"
    );
    expect(documentStorageAdapterStub.getExistingInvoiceForDeal).toHaveBeenCalledWith(
      "DEAL-003"
    );
    expect(documentStorageAdapterStub.getExistingInvoiceForDeal).toHaveBeenCalledTimes(3);
  });
});