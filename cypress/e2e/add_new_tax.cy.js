describe('Taxes Form - All Test Cases', () => {
  beforeEach(() => {
    // Log in and navigate to taxes page
    cy.visit('http://localhost:3000/login');
    cy.get('button.login-form-button').click();
    cy.url().should('eq', 'http://localhost:3000/');
    
    // Wait for taxes page to fully load
    cy.visit('http://localhost:3000/taxes');
    
    // Wait for page to be ready
    cy.get('body', { timeout: 10000 }).should('be.visible');
    
    // Wait for the main content to load
    cy.get('.ant-layout-content', { timeout: 10000 }).should('be.visible');
    
    // Use a more reliable way to find and click the button
    cy.get('body').then(($body) => {
      // Check if button exists and is visible
      if ($body.find('button:contains("Add New Tax")').length) {
        cy.contains('button', 'Add New Tax').click({ force: true });
      } else {
        // If button doesn't exist, wait and retry
        cy.wait(1000);
        cy.contains('button', 'Add New Tax').click({ force: true });
      }
    });
    
    // Wait for drawer to be visible
    cy.get('.ant-drawer-content', { timeout: 10000 }).should('be.visible');
    
    // Get the form
    cy.get('.BottomCollapseBox form.ant-form', { timeout: 10000 })
      .should('be.visible')
      .as('form');
  });

  // ---------------- Name Field Tests ----------------
  describe('Name Field (Required)', () => {
    it('Accepts valid Name - contains alphabets', () => {
      cy.get('@form').find('#taxName').type('Sales Tax');
      cy.get('@form').find('#taxValue').type('15');
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully without validation errors
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Rejects empty Name', () => {
      // Leave Name empty
      cy.get('@form').find('#taxName').clear();
      cy.get('@form').find('#taxValue').type('15');
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should show validation error message
      cy.contains('Please enter Name').should('be.visible');
    });
  });

  // ---------------- Value Field Tests ----------------
  describe('Value Field (Required)', () => {
    it('Accepts valid Value - 0<=V<=100', () => {
      cy.get('@form').find('#taxName').type('Test Tax');
      cy.get('@form').find('#taxValue').type('50');
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully without validation errors
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Rejects empty Value', () => {
      cy.get('@form').find('#taxName').type('Valid Tax Name');
      // Leave Value empty
      cy.get('@form').find('#taxValue').clear();
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should show validation error message
      cy.contains('Please input tax value').should('be.visible');
    });
  });

  // ---------------- Enabled Switch Tests ----------------
  describe('Enabled Switch', () => {
    it('Accepts Enabled = true', () => {
      cy.get('@form').find('#taxName').type('Enabled Tax');
      cy.get('@form').find('#taxValue').type('15');
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Accepts Enabled = false', () => {
      cy.get('@form').find('#taxName').type('Disabled Tax');
      cy.get('@form').find('#taxValue').type('20');
      
      // Toggle switch to false
      cy.get('@form').find('#enabled').click();
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });
  });

  // ---------------- Default Switch Tests ----------------
  describe('Default Switch', () => {
    it('Accepts Default = true', () => {
      cy.get('@form').find('#taxName').type('Default Tax');
      cy.get('@form').find('#taxValue').type('18');
      
      // Toggle switch to true
      cy.get('@form').find('#isDefault').click();
      
      // Submit the form
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Accepts Default = false', () => {
      cy.get('@form').find('#taxName').type('Non-Default Tax');
      cy.get('@form').find('#taxValue').type('12');
      
      // Submit the form (default is already false)
      cy.get('@form').find('button[type="submit"]').contains('Submit').click();
      
      // Should submit successfully
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });
  });
});