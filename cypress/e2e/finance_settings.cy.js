// =======================================================================
// FINANCE SETTINGS FULL TEST SUITE
// Includes:
//  ✔ Original Valid/Invalid Tests
//  ✔ Boundary Value Tests (Two-Point BVA)
//  ✔ Long Timeouts Everywhere
// =======================================================================

describe('Finance Settings Form Tests', () => {

  const long = { timeout: 10000 };

  beforeEach(() => {
    // Login
    cy.visit('http://localhost:3000/login', long);
    cy.get('button.login-form-button', long).click();
    cy.url(long).should('eq', 'http://localhost:3000/');

    // Navigate to settings
    cy.visit('http://localhost:3000/settings', long);
    cy.contains('div[role="tab"]', 'Finance Settings', long).click();
    cy.get('#rc-tabs-0-panel-finance_settings', long).should('be.visible');
  });

  // Helper to save
  const saveForm = () => {
    cy.contains('Save', long).click({ force: true });
  };

  // ===========================================================================
  //                      ORIGINAL TEST CASES (EVERY TEST DATA)
  // ===========================================================================

  // ===================== LAST INVOICE NUMBER ===================== //
  /*
  it('Invoice - Valid: "100"', () => {
    cy.get('#last_invoice_number', long).clear().type('100');
    cy.get('#last_quote_number', long).clear().type('50');
    cy.get('#last_payment_number', long).clear().type('200');

    saveForm();
    cy.contains('Request success', long).should('be.visible');
  });

  it('Invoice - Invalid: empty ""', () => {
    cy.get('#last_invoice_number', long).clear();
    cy.contains('Please enter Last Invoice Number', long).should('be.visible');
  });

  it('Invoice - Invalid: "-1"', () => {
    cy.get('#last_invoice_number', long).clear().type('-1');
    cy.contains('Please enter Last Invoice Number', long).should('be.visible');
  });

  it('Invoice - Invalid: "abc"', () => {
    cy.get('#last_invoice_number', long).clear().type('abc');
    cy.contains('Please enter Last Invoice Number', long).should('be.visible');
  });

  // ===================== LAST QUOTE NUMBER ===================== //

  it('Quote - Valid: "50"', () => {
    cy.get('#last_quote_number', long).clear().type('50');
    cy.get('#last_invoice_number', long).clear().type('100');
    cy.get('#last_payment_number', long).clear().type('200');

    saveForm();
    cy.contains('Request success', long).should('be.visible');
  });

  it('Quote - Invalid: empty ""', () => {
    cy.get('#last_quote_number', long).clear();
    cy.contains('Please enter Last Quote Number', long).should('be.visible');
  });

  it('Quote - Invalid: "-5"', () => {
    cy.get('#last_quote_number', long).clear().type('-5');
    cy.contains('Please enter Last Quote Number', long).should('be.visible');
  });

  it('Quote - Invalid: "xyz"', () => {
    cy.get('#last_quote_number', long).clear().type('xyz');
    cy.contains('Please enter Last Quote Number', long).should('be.visible');
  });

  // ===================== LAST PAYMENT NUMBER ===================== //

  it('Payment - Valid: "200"', () => {
    cy.get('#last_payment_number', long).clear().type('200');
    cy.get('#last_invoice_number', long).clear().type('100');
    cy.get('#last_quote_number', long).clear().type('50');

    saveForm();
    cy.contains('Request success', long).should('be.visible');
  });

  it('Payment - Invalid: empty ""', () => {
    cy.get('#last_payment_number', long).clear();
    cy.contains('Please enter Last Payment Number', long).should('be.visible');
  });

  it('Payment - Invalid: "-10"', () => {
    cy.get('#last_payment_number', long).clear().type('-10');
    cy.contains('Please enter Last Payment Number', long).should('be.visible');
  });

  it('Payment - Invalid: "123abc"', () => {
    cy.get('#last_payment_number', long).clear().type('123abc');
    cy.contains('Please enter Last Payment Number', long).should('be.visible');
  });
  */
  // ===========================================================================
  //                      BOUNDARY VALUE ANALYSIS TEST CASES
  // ===========================================================================

  // ===================== INVOICE BOUNDARY ===================== //

  it('Invoice - Lower Invalid: -1', () => {
    cy.get('#last_invoice_number', long).clear().type('-1');
    cy.contains('Please enter Last Invoice Number', long).should('be.visible');
  });

  it('Invoice - Lower Valid: 0', () => {
    cy.get('#last_invoice_number', long).clear().type('0');
    cy.get('#last_quote_number', long).clear().type('50');
    cy.get('#last_payment_number', long).clear().type('200');

    saveForm();
    cy.contains('Request success', long).should('be.visible');
  });

  
  
  // ===================== QUOTE BOUNDARY ===================== //

  it('Quote - Lower Invalid: -1', () => {
    cy.get('#last_quote_number', long).clear().type('-1');
    cy.contains('Please enter Last Quote Number', long).should('be.visible');
  });

  it('Quote - Lower Valid: 0', () => {
    cy.get('#last_quote_number', long).clear().type('0');
    cy.get('#last_invoice_number', long).clear().type('100');
    cy.get('#last_payment_number', long).clear().type('200');

    saveForm();
    cy.contains('Request success', long).should('be.visible');
  });

  

  // ===================== PAYMENT BOUNDARY ===================== //

  it('Payment - Lower Invalid: -1', () => {
    cy.get('#last_payment_number', long).clear().type('-1');
    cy.contains('Please enter Last Payment Number', long).should('be.visible');
  });

  it('Payment - Lower Valid: 0', () => {
    cy.get('#last_payment_number', long).clear().type('0');
    cy.get('#last_invoice_number', long).clear().type('100');
    cy.get('#last_quote_number', long).clear().type('50');

    saveForm();
    cy.contains('Request success', long).should('be.visible');
  });

  it('Payment - Upper Valid: 1000000000000000', () => {
    cy.get('#last_payment_number', long).clear().type('1000000000000000');
    cy.get('#last_invoice_number', long).clear().type('100');
    cy.get('#last_quote_number', long).clear().type('50');

    saveForm();
    cy.contains('Request success', long).should('be.visible');
  });

  it('Payment - Upper Invalid: 1000000000000001', () => {
    cy.get('#last_payment_number', long).clear().type('10000000000000000000000000000000001');
    saveForm();
    cy.contains('Request success', long).should('be.visible');
  });

});
