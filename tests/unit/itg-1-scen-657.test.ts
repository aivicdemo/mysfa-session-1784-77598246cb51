import { describe, test, expect } from "@jest/globals";
import { InvoiceValidationService } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-657: 請求書発行日が無効な日付形式のときバリデーションエラーが発生する", () => {
    const service = new InvoiceValidationService();

    const invalid_date_formats = [
      "2024-13-45",
      "2024/02/30",
      "invalid-date",
      "",
      "2024-02-30",
      "2024-13-01",
      "abc-def-ghi",
      "2024/13/45",
      null,
      undefined,
    ];

    invalid_date_formats.forEach((invalid_format) => {
      expect(() => {
        service.validateInvoiceIssueDate(invalid_format as any);
      }).toThrow(/INVALID_DATE_FORMAT/);
    });
  });
});