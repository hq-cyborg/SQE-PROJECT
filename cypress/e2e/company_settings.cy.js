describe('Company Settings Form Test', () => {
  beforeEach(() => {
    // Log in
    cy.visit('http://localhost:3000/login');
    cy.get('button.login-form-button').click();
    cy.url().should('eq', 'http://localhost:3000/');
    
    // Navigate to settings page
    cy.visit('http://localhost:3000/settings');
  });

  it('should fill all company settings fields and submit', () => {
    // Click on Company Settings tab
    cy.contains('div[role="tab"]', 'Company Settings').click();
    
    // Wait for company settings content to load
    cy.get('#rc-tabs-0-panel-company_settings', { timeout: 5000 })
      .should('be.visible');

    // Clear and fill all fields with waits between operations
    const fields = [
      { id: '#company_name', value: 'Tech Solutions Ltd' },
      { id: '#company_address', value: '123 Business Avenue, Downtown' },
      { id: '#company_state', value: 'California' },
      { id: '#company_country', value: 'United States' },
      { id: '#company_email', value: 'contact@company.com' },
      { id: '#company_phone', value: '+1-555-0123' },
      { id: '#company_website', value: 'www.company.com' },
      { id: '#company_tax_number', value: 'TX-123456789' },
      { id: '#company_vat_number', value: 'VAT-987654321' },
      { id: '#company_reg_number', value: 'REG-456789123' }
    ];

    fields.forEach(field => {
      cy.get(field.id)
        .clear()
        .should('have.value', '') // Verify field is cleared
        .type(field.value)
        .should('have.value', field.value); // Verify field has new value
    });

    // Submit the form
    cy.get('#rc-tabs-0-panel-company_settings')
      .find('button.ant-btn-primary')
      .contains('Save')
      .click({ force: true });
    
    // Verify success
    cy.contains('Request success', { timeout: 10000 })
      .should('be.visible');
  });
});