import { calculateInitialConstructionCost } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforce License Management - Initial Construction Cost Calculation', () => {
  test('SCEN-032: [error] Initial construction cost calculation - error occurs when staff unit price is invalid', () => {
    const validInputs = {
      developmentScale: 'medium',
      estimatedWorkload: 1200,
      staffUnitPrice: 5000000,
    };

    const invalidInputsArray = [
      { ...validInputs, staffUnitPrice: -100000 },
      { ...validInputs, staffUnitPrice: 0 },
      { ...validInputs, staffUnitPrice: null },
      { ...validInputs, staffUnitPrice: undefined },
      { ...validInputs, staffUnitPrice: 'invalid' as any },
      { ...validInputs, staffUnitPrice: NaN },
      { ...validInputs, staffUnitPrice: Infinity },
    ];

    invalidInputsArray.forEach((invalidInput) => {
      expect(() => calculateInitialConstructionCost(invalidInput)).toThrow(/単価/);
    });

    const validResult = calculateInitialConstructionCost(validInputs);
    expect(validResult).toEqual({
      initialCost: 6000000,
      developmentPeriodMonths: 6,
      estimatedCompletion: '2024-07-31T23:59:59Z',
    });
  });
});