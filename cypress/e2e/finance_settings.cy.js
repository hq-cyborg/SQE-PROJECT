describe('Finance Settings Form Tests', () => {
  beforeEach(() => {
    // Log in
    cy.visit('http://localhost:3000/login');
    cy.get('button.login-form-button').click();
    cy.url().should('eq', 'http://localhost:3000/');
    
    // Navigate to settings page
    cy.visit('http://localhost:3000/settings');
    
    // Click on Finance Settings button/tab
    cy.contains('div[role="tab"]', 'Finance Settings').click();
    cy.get('#rc-tabs-0-panel-finance_settings', { timeout: 5000 })
      .should('be.visible');
  });

  describe('Last Invoice Number Tests', () => {
    it('should accept valid last invoice number "100"', () => {
      cy.get('#last_invoice_number').clear().type('100');
      cy.get('#last_invoice_number').should('have.value', '100');

      // Set other required fields
      cy.get('#last_quote_number').clear().type('50');
      cy.get('#last_payment_number').clear().type('200');

      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should reject empty last invoice number', () => {
      cy.get('#last_invoice_number').clear();
      
      // Verify error message
      cy.contains('Please enter Last Invoice Number').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Last Invoice Number').should('be.visible');
    });

    it('should reject negative last invoice number "-1"', () => {
      cy.get('#last_invoice_number').clear().type('-1');
      
      // Verify error message
      cy.contains('Please enter Last Invoice Number').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Last Invoice Number').should('be.visible');
    });

    it('should reject alphabetic last invoice number "abc"', () => {
      cy.get('#last_invoice_number').clear().type('abc');
      
      // Verify error message
      cy.contains('Please enter Last Invoice Number').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Last Invoice Number').should('be.visible');
    });
  });

  describe('Last Quote Number Tests', () => {
    it('should accept valid last quote number "50"', () => {
      cy.get('#last_quote_number').clear().type('50');
      cy.get('#last_quote_number').should('have.value', '50');

      // Set other required fields
      cy.get('#last_invoice_number').clear().type('100');
      cy.get('#last_payment_number').clear().type('200');

      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should reject empty last quote number', () => {
      cy.get('#last_quote_number').clear();
      
      // Verify error message
      cy.contains('Please enter Last Quote Number').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Last Quote Number').should('be.visible');
    });

    it('should reject negative last quote number "-5"', () => {
      cy.get('#last_quote_number').clear().type('-5');
      
      // Verify error message
      cy.contains('Please enter Last Quote Number').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Last Quote Number').should('be.visible');
    });

    it('should reject alphabetic last quote number "xyz"', () => {
      cy.get('#last_quote_number').clear().type('xyz');
      
      // Verify error message
      cy.contains('Please enter Last Quote Number').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Last Quote Number').should('be.visible');
    });
  });

  describe('Last Payment Number Tests', () => {
    it('should accept valid last payment number "200"', () => {
      cy.get('#last_payment_number').clear().type('200');
      cy.get('#last_payment_number').should('have.value', '200');

      // Set other required fields
      cy.get('#last_invoice_number').clear().type('100');
      cy.get('#last_quote_number').clear().type('50');

      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should reject empty last payment number', () => {
      cy.get('#last_payment_number').clear();
      
      // Verify error message
      cy.contains('Please enter Last Payment Number').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Last Payment Number').should('be.visible');
    });

    it('should reject negative last payment number "-10"', () => {
      cy.get('#last_payment_number').clear().type('-10');
      
      // Verify error message
      cy.contains('Please enter Last Payment Number').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Last Payment Number').should('be.visible');
    });

    it('should reject alphanumeric last payment number "123abc"', () => {
      cy.get('#last_payment_number').clear().type('123abc');
      
      // Verify error message
      cy.contains('Please enter Last Payment Number').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Last Payment Number').should('be.visible');
    });
  });

  describe('Combined Valid Test', () => {
    it('should submit form with all valid fields', () => {
      // Set all fields to valid values
      cy.get('#last_invoice_number').clear().type('100');
      cy.get('#last_quote_number').clear().type('50');
      cy.get('#last_payment_number').clear().type('200');

      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });
  });

  describe('Error Clearance Tests', () => {
    it('should clear error when valid value is entered after invalid', () => {
      // First enter invalid value
      cy.get('#last_invoice_number').clear().type('abc');
      cy.contains('Please enter Last Invoice Number').should('be.visible');

      // Then enter valid value
      cy.get('#last_invoice_number').clear().type('100');
      
      // Error message should disappear
      cy.contains('Please enter Last Invoice Number').should('not.exist');

      // Set other fields
      cy.get('#last_quote_number').clear().type('50');
      cy.get('#last_payment_number').clear().type('200');

      // Submit should work now
      cy.get('#rc-tabs-0-panel-finance_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });
  });
});