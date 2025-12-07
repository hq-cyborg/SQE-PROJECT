describe('Taxes Form - All Test Cases', () => {
  beforeEach(() => {
    // Log in and navigate to taxes page
    cy.visit('http://localhost:3000/login', { timeout: 15000 });
    cy.get('button.login-form-button', { timeout: 10000 }).click();
    cy.url({ timeout: 15000 }).should('eq', 'http://localhost:3000/');
    
    // Taxes Page
    cy.visit('http://localhost:3000/taxes', { timeout: 15000 });
    
    cy.get('body', { timeout: 15000 }).should('be.visible');
    cy.get('.ant-layout-content', { timeout: 15000 }).should('be.visible');
    
    // Add New Tax button
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Add New Tax")').length) {
        cy.contains('button', 'Add New Tax').click({ force: true });
      } else {
        cy.wait(1000);
        cy.contains('button', 'Add New Tax').click({ force: true });
      }
    });
    
    // Drawer visible
    cy.get('.ant-drawer-content', { timeout: 15000 }).should('be.visible');
    
    // Form alias
    cy.get('.BottomCollapseBox form.ant-form', { timeout: 15000 })
      .should('be.visible')
      .as('form');
  });
  
  // ---------------- Name Field Tests ----------------
  describe('Name Field (Required)', () => {

    it('Accepts valid Name - contains alphabets', () => {
      cy.get('@form').find('#taxName').type('Sales Tax');
      cy.get('@form').find('#taxValue').type('15');

      cy.get('@form').find('button[type="submit"]').contains('Submit').click({ timeout: 12000 });
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Rejects empty Name', () => {
      cy.get('@form').find('#taxName').clear();
      cy.get('@form').find('#taxValue').type('15');

      cy.get('@form').find('button[type="submit"]').contains('Submit').click({ timeout: 12000 });

      cy.contains('Please enter Name', { timeout: 10000 }).should('be.visible');
    });
  });
  
  // ---------------- Value Field Tests ----------------
  describe('Value Field (0 ≤ V ≤ 100)', () => {

    // VALID VALUE
    it('Accepts valid Value (50)', () => {
      cy.get('@form').find('#taxName').type('Test Tax');
      cy.get('@form').find('#taxValue').type('50');

      cy.get('@form').find('button[type="submit"]').contains('Submit').click({ timeout: 12000 });
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    // EMPTY VALUE
    it('Rejects empty Value', () => {
      cy.get('@form').find('#taxName').type('Valid Tax Name');
      cy.get('@form').find('#taxValue').clear();

      cy.get('@form').find('button[type="submit"]').contains('Submit').click({ timeout: 12000 });

      cy.contains('Please input tax value', { timeout: 10000 }).should('be.visible');
    });

    // ---------------- BOUNDARY VALUE ANALYSIS ----------------

    it('Autocorrects Lower Invalid Value (-1)', () => {
      cy.get('@form').find('#taxName').type('Tax Lower Invalid');
      cy.get('@form').find('#taxValue').type('-1');

      cy.get('@form').find('button[type="submit"]').contains('Submit').click();

      cy.contains('Request success', { timeout: 10000 }).should('be.visible');
    });

    it('Accepts Lower Valid Value (0)', () => {
      cy.get('@form').find('#taxName').type('Tax Lower Valid');
      cy.get('@form').find('#taxValue').type('0');

      cy.get('@form').find('button[type="submit"]').contains('Submit').click({ timeout: 12000 });

      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Accepts Upper Valid Value (100)', () => {
      cy.get('@form').find('#taxName').type('Tax Upper Valid');
      cy.get('@form').find('#taxValue').type('100');

      cy.get('@form').find('button[type="submit"]').contains('Submit').click({ timeout: 12000 });

      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });
    
    it('Autocorrects Upper Invalid Value (101)', () => {
      cy.get('@form').find('#taxName').type('Tax Upper Invalid');
      cy.get('@form').find('#taxValue').type('101');

      cy.get('@form').find('button[type="submit"]').contains('Submit').click();

      cy.contains('Request success', { timeout: 10000 }).should('be.visible');
    });
  });

  // ---------------- Enabled Switch Tests ----------------
  describe('Enabled Switch', () => {

    it('Accepts Enabled = true', () => {
      cy.get('@form').find('#taxName').type('Enabled Tax');
      cy.get('@form').find('#taxValue').type('15');

      cy.get('@form').find('button[type="submit"]').contains('Submit').click({ timeout: 12000 });

      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Accepts Enabled = false', () => {
      cy.get('@form').find('#taxName').type('Disabled Tax');
      cy.get('@form').find('#taxValue').type('20');

      cy.get('@form').find('#enabled').click();
      
      cy.get('@form').find('button[type="submit"]').contains('Submit').click({ timeout: 12000 });

      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });
  });

  // ---------------- Default Switch Tests ----------------
  describe('Default Switch', () => {

    it('Accepts Default = true', () => {
      cy.get('@form').find('#taxName').type('Default Tax');
      cy.get('@form').find('#taxValue').type('18');

      cy.get('@form').find('#isDefault').click();

      cy.get('@form').find('button[type="submit"]').contains('Submit').click({ timeout: 12000 });

      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Accepts Default = false', () => {
      cy.get('@form').find('#taxName').type('Non-Default Tax');
      cy.get('@form').find('#taxValue').type('12');

      cy.get('@form').find('button[type="submit"]').contains('Submit').click({ timeout: 12000 });

      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });
  });
});
