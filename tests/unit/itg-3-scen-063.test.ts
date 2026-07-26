import { calculateAnnualLicenseCost } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce license annual cost calculation validation", () => {
  // SCEN-063
  test("should throw error when annual license cost calculation receives invalid input values", () => {
    const validLicenseData = {
      editionName: "Professional",
      userCount: 10,
      unitPrice: 165,
    };

    // Test with negative number
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        userCount: -5,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with null userCount
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        userCount: null as any,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with undefined userCount
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        userCount: undefined as any,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with string value for userCount
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        userCount: "ten" as any,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with negative unitPrice
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        unitPrice: -100,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with null unitPrice
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        unitPrice: null as any,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with undefined unitPrice
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        unitPrice: undefined as any,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with string value for unitPrice
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        unitPrice: "165" as any,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with zero userCount (boundary case - invalid)
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        userCount: 0,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with zero unitPrice (boundary case - invalid)
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        unitPrice: 0,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with NaN
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        userCount: NaN,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with Infinity
    expect(() =>
      calculateAnnualLicenseCost({
        ...validLicenseData,
        userCount: Infinity,
      })
    ).toThrow(/年間ライセンス費用/);

    // Test with valid input should succeed
    const result = calculateAnnualLicenseCost({
      editionName: "Professional",
      userCount: 10,
      unitPrice: 165,
    });

    expect(typeof result).toBe("number");
    expect(result).toBe(19800); // 10 users * 165 USD * 12 months
  });
});