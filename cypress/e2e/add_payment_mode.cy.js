describe('Payment Mode Form - All Test Cases', () => {
  beforeEach(() => {
    // Log in and navigate to payment mode page
    cy.visit('http://localhost:3000/login');
    cy.get('button.login-form-button').click();
    cy.url().should('eq', 'http://localhost:3000/');
    
    // Wait for payment mode page to fully load
    cy.visit('http://localhost:3000/payment/mode');
    
    // Wait for the page to be fully loaded - use more generic selectors
    cy.get('body', { timeout: 10000 }).should('be.visible');
    cy.contains('Payment Mode List', { timeout: 10000 }).should('be.visible');
    
    // Wait for any loading to complete
    cy.get('.ant-spin-container', { timeout: 10000 }).should('exist');
    
    // Use a more stable approach to find and click the button
    cy.contains('button', 'Add New Payment Mode', { timeout: 10000 })
      .should('be.visible')
      .and('not.be.disabled')
      .click();
    
    // Wait for drawer to be visible and form to load
    cy.get('.ant-drawer-content', { timeout: 10000 }).should('be.visible');
    cy.get('.BottomCollapseBox form.ant-form', { timeout: 10000 })
      .should('be.visible')
      .as('form');
  });

  // ---------------- Payment Mode Field Tests ----------------
  describe('Payment Mode Field (Required)', () => {
    it('Accepts valid Payment Mode - any text', () => {
      cy.get('@form').find('#name').first().type('Credit Card');
      cy.get('@form').find('#description').first().type('Valid description');
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully without validation errors
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Rejects empty Payment Mode', () => {
      // Leave Payment Mode empty
      cy.get('@form').find('#name').first().clear();
      cy.get('@form').find('#description').first().type('Valid description');
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should show validation error message
      cy.contains('Please enter Payment Mode')
        .should('be.visible');
    });
  });

  // ---------------- Description Field Tests ----------------
  describe('Description Field (Required)', () => {
    it('Accepts valid Description - any text', () => {
      cy.get('@form').find('#name').first().type('Bank Transfer');
      cy.get('@form').find('#description').first().type('Direct bank transfer');
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully without validation errors
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Rejects empty Description', () => {
      cy.get('@form').find('#name').first().type('Valid Payment Mode');
      // Leave Description empty
      cy.get('@form').find('#description').first().clear();
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should show validation error message
      cy.contains('Please enter Description')
        .should('be.visible');
    });
  });

  // ---------------- Enabled Switch Tests ----------------
  describe('Enabled Switch', () => {
    it('Accepts Enabled = true', () => {
      cy.get('@form').find('#name').first().type('Cash Payment');
      cy.get('@form').find('#description').first().type('Cash payment method');
      
      // Ensure switch is enabled (default state is true)
      cy.get('@form').find('#enabled').first().should('have.class', 'ant-switch-checked');
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Accepts Enabled = false', () => {
      cy.get('@form').find('#name').first().type('Disabled Payment');
      cy.get('@form').find('#description').first().type('Disabled payment method');
      
      // Toggle switch to false
      cy.get('@form').find('#enabled').first().click();
      cy.get('@form').find('#enabled').first().should('not.have.class', 'ant-switch-checked');
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });
  });

  // ---------------- Default Mode Switch Tests ----------------
  describe('Default Mode Switch', () => {
    it('Accepts Default Mode = true', () => {
      cy.get('@form').find('#name').first().type('Primary Payment');
      cy.get('@form').find('#description').first().type('Default payment method');
      
      // Toggle switch to true
      cy.get('@form').find('#isDefault').first().click();
      cy.get('@form').find('#isDefault').first().should('have.class', 'ant-switch-checked');
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Accepts Default Mode = false', () => {
      cy.get('@form').find('#name').first().type('Secondary Payment');
      cy.get('@form').find('#description').first().type('Non-default payment method');
      
      // Ensure switch is false (default state)
      cy.get('@form').find('#isDefault').first().should('not.have.class', 'ant-switch-checked');
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });
  });
});