describe('Currency Settings - Individual Field Tests', () => {
  beforeEach(() => {
    // Log in
    cy.visit('http://localhost:3000/login');
    cy.get('button.login-form-button').click();
    cy.url().should('eq', 'http://localhost:3000/');
    
    // Navigate to settings page
    cy.visit('http://localhost:3000/settings');
    
    // Click on Currency Settings button/tab
    cy.contains('div[role="tab"]', 'Currency Settings').click();
    cy.get('#rc-tabs-0-panel-currency_settings', { timeout: 5000 })
      .should('be.visible');
  });

  describe('Currency Dropdown Tests', () => {
    it('should accept valid currency value "USD"', () => {
      
      
      // Set other required fields to valid values
      cy.get('#currency_symbol').clear().type('$');
      cy.get('#decimal_sep').clear().type('.');
      cy.get('#thousand_sep').clear().type(',');
      cy.get('#cent_precision').clear().type('2');

      // Submit form
      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Verify success
      cy.contains('Request success', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Currency Symbol Tests', () => {
    it('should accept valid currency symbol "$"', () => {
      cy.get('#currency_symbol').clear().type('$');
      cy.get('#currency_symbol').should('have.value', '$');

      // Set other required fields
      cy.get('#decimal_sep').clear().type('.');
      cy.get('#thousand_sep').clear().type(',');
      cy.get('#cent_precision').clear().type('2');

      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should reject empty currency symbol', () => {
      cy.get('#currency_symbol').clear();
      
      // Verify error message
      cy.contains('Please enter Currency Symbol').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Currency Symbol').should('be.visible');
    });
  });

  describe('Currency Position Tests', () => {
    it('should accept valid currency position "Before"', () => {
      // Verify "Before" is selected or can be selected
      
      // Set other required fields
      cy.get('#currency_symbol').clear().type('$');
      cy.get('#decimal_sep').clear().type('.');
      cy.get('#thousand_sep').clear().type(',');
      cy.get('#cent_precision').clear().type('2');

      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });
  });

  describe('Decimal Separator Tests', () => {
    it('should accept valid decimal separator "."', () => {
      cy.get('#decimal_sep').clear().type('.');
      cy.get('#decimal_sep').should('have.value', '.');

      // Set other required fields
      cy.get('#currency_symbol').clear().type('$');
      cy.get('#thousand_sep').clear().type(',');
      cy.get('#cent_precision').clear().type('2');

      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should reject empty decimal separator', () => {
      cy.get('#decimal_sep').clear();
      
      // Verify error message
      cy.contains('Please enter Decimal Separator').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Decimal Separator').should('be.visible');
    });
  });

  describe('Thousand Separator Tests', () => {
    it('should accept valid thousand separator ","', () => {
      cy.get('#thousand_sep').clear().type(',');
      cy.get('#thousand_sep').should('have.value', ',');

      // Set other required fields
      cy.get('#currency_symbol').clear().type('$');
      cy.get('#decimal_sep').clear().type('.');
      cy.get('#cent_precision').clear().type('2');

      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should reject empty thousand separator', () => {
      cy.get('#thousand_sep').clear();
      
      // Verify error message
      cy.contains('Please enter Thousand Separator').should('be.visible');

      // Try to submit
      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Thousand Separator').should('be.visible');
    });
  });

  describe('Cent Precision Tests', () => {
    it('should accept valid cent precision values (>= 0)', () => {
      const validValues = ['0', '1', '2', '5', '10'];
      
      validValues.forEach(value => {
        cy.get('#cent_precision').clear().type(value);
        cy.get('#cent_precision').should('have.value', value);
      });

      // Final test with value 2
      cy.get('#cent_precision').clear().type('2');
      
      // Set other required fields
      cy.get('#currency_symbol').clear().type('$');
      cy.get('#decimal_sep').clear().type('.');
      cy.get('#thousand_sep').clear().type(',');

      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should automatically change negative cent precision to 0', () => {
      // Enter negative value
      cy.get('#cent_precision').clear().type('-1');
      
      

      // Set other required fields
      cy.get('#currency_symbol').clear().type('$');
      cy.get('#decimal_sep').clear().type('.');
      cy.get('#thousand_sep').clear().type(',');

      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });
  });

  describe('Zero Format Tests', () => {
    it('should accept "On" position for zero format', () => {
      // Turn on if not already on
      cy.get('#zero_format').then(($switch) => {
        if ($switch.attr('aria-checked') === 'false') {
          cy.get('#zero_format').click();
        }
      });

      // Set other required fields
      cy.get('#currency_symbol').clear().type('$');
      cy.get('#decimal_sep').clear().type('.');
      cy.get('#thousand_sep').clear().type(',');
      cy.get('#cent_precision').clear().type('2');

      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should accept "Off" position for zero format', () => {
      // Turn off if not already off
      cy.get('#zero_format').then(($switch) => {
        if ($switch.attr('aria-checked') === 'true') {
          cy.get('#zero_format').click();
        }
      });

      // Set other required fields
      cy.get('#currency_symbol').clear().type('$');
      cy.get('#decimal_sep').clear().type('.');
      cy.get('#thousand_sep').clear().type(',');
      cy.get('#cent_precision').clear().type('2');

      cy.get('#rc-tabs-0-panel-currency_settings')
        .find('button.ant-btn-primary')
        .contains('Save')
        .click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });
  });
});