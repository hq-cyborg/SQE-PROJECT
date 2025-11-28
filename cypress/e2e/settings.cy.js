describe('General Settings Form - 3 Test Cases', () => {
  beforeEach(() => {
    // Log in
    cy.visit('http://localhost:3000/login');
    cy.get('button.login-form-button').click();
    cy.url().should('eq', 'http://localhost:3000/');
    
    // Navigate to settings page
    cy.visit('http://localhost:3000/settings');
    
    // Wait for settings panel
    cy.get('#rc-tabs-0-panel-general_settings', { timeout: 10000 })
      .should('be.visible');
  });

  

  // Test Case 2: Form with email filled
  it('Accepts form submission with email filled', () => {
    cy.get('#rc-tabs-0-panel-general_settings').within(() => {
      cy.get('form.ant-form').within(() => {
        // Fill email field
        cy.get('#idurar_app_company_email')
          .clear()
          .type('admin@company.com')
          .should('have.value', 'admin@company.com');
        
        // Submit form
        cy.get('button[type="submit"]').contains('Save').click();
      });
    });
    
    // Check for errors after submission (wait for potential re-render)
    cy.get('body').then(($body) => {
      if ($body.find('.ant-form-item-explain-error').length) {
        cy.get('.ant-form-item-explain-error').should('not.exist');
      }
      // If no errors found, that's also success
    });
  });

  // Test Case 3: Form without email (empty)
  it('Rejects form submission without email - shows "Please enter Email"', () => {
    cy.get('#rc-tabs-0-panel-general_settings').within(() => {
      cy.get('form.ant-form').within(() => {
        // Clear email field (leave it empty)
        cy.get('#idurar_app_company_email').clear();
        
        // Submit form
        cy.get('button[type="submit"]').contains('Save').click();
      });
    });
    
    // Wait for specific validation error message
    cy.contains('Please enter Email', { timeout: 10000 })
      .should('be.visible');
  });
});