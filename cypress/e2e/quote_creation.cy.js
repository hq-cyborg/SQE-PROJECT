describe('Quote Creation Form - All Test Cases', () => {
  beforeEach(() => {
    // Log in and navigate to quote creation page
    cy.visit('http://localhost:3000/login');
    cy.get('button.login-form-button').click();
    cy.url().should('eq', 'http://localhost:3000/');
    
    // Navigate to quote creation page
    cy.visit('http://localhost:3000/quote/create');
    
    // Wait for page to load
    cy.get('form.ant-form', { timeout: 10000 }).should('be.visible').as('form');
  });

  // ---------------- Client Field Tests ----------------
  describe('Client Field (Required)', () => {
    it('Accepts valid Client - any valid client', () => {
      // Click on client dropdown
      cy.get('@form').find('#rc_select_16').click();
      // Type to search for a client
      cy.get('@form').find('#rc_select_16').type('Test Client');
      // Select the first option
      cy.get('.ant-select-item-option').first().click();
      
      // Should have selected a client
      cy.get('@form').find('.ant-select-selection-item').should('exist');
    });

    it('Rejects empty Client', () => {
      // Leave client empty and try to submit
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      
      // Should show validation error
      cy.contains('Client is required').should('be.visible');
    });
  });

  // ---------------- Number Field Tests ----------------
  describe('Number Field (Required)', () => {
    it('Accepts valid Number - "1"', () => {
      cy.get('@form').find('#number').clear().type('1');
      cy.get('@form').find('#number').should('have.value', '1');
    });

    it('Rejects empty Number', () => {
      cy.get('@form').find('#number').clear();
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      cy.contains('Number is required').should('be.visible');
    });

    it('Rejects Number with alphabets - "ABC"', () => {
      cy.get('@form').find('#number').clear().type('ABC');
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      cy.contains('Number must be numeric').should('be.visible');
    });

    it('Rejects Number <= 0', () => {
      cy.get('@form').find('#number').clear().type('0');
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      cy.contains('Number must be greater than 0').should('be.visible');
    });
  });

  // ---------------- Year Field Tests ----------------
  describe('Year Field (Required)', () => {
    it('Accepts valid Year - >=0', () => {
      cy.get('@form').find('#year').clear().type('2025');
      cy.get('@form').find('#year').should('have.value', '2025');
    });

    it('Rejects Year with alphabets - "YearABC"', () => {
      cy.get('@form').find('#year').clear().type('YearABC');
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      cy.contains('Year must be numeric').should('be.visible');
    });

    it('Rejects Year < 0', () => {
      cy.get('@form').find('#year').clear().type('-1');
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      cy.contains('Year must be positive').should('be.visible');
    });
  });

  // ---------------- Date Field Tests ----------------
  describe('Date Field (Required)', () => {
    it('Accepts valid Date - any date from selector', () => {
      // The date field already has a default value
      cy.get('@form').find('#date').should('have.value', '28/11/2025');
    });

    it('Rejects empty Date', () => {
      cy.get('@form').find('#date').clear();
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      cy.contains('Date is required').should('be.visible');
    });
  });

  // ---------------- Expire Date Field Tests ----------------
  describe('Expire Date Field (Required)', () => {
    it('Accepts valid Expire Date - any date from selector', () => {
      // The expire date field already has a default value
      cy.get('@form').find('#expiredDate').should('have.value', '28/12/2025');
    });

    it('Rejects empty Expire Date', () => {
      cy.get('@form').find('#expiredDate').clear();
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      cy.contains('Expire Date is required').should('be.visible');
    });
  });

  // ---------------- Description Field Tests ----------------
  describe('Description Field', () => {
    it('Accepts valid Description - any text', () => {
      cy.get('@form').find('#items_0_description').type('Test description for item');
      cy.get('@form').find('#items_0_description').should('have.value', 'Test description for item');
    });
  });

  // ---------------- Note Field Tests ----------------
  describe('Note Field', () => {
    it('Accepts valid Note - any text', () => {
      cy.get('@form').find('#notes').type('This is a test note');
      cy.get('@form').find('#notes').should('have.value', 'This is a test note');
    });
  });

  // ---------------- Quantity Field Tests ----------------
  describe('Quantity Field', () => {
    it('Accepts valid Quantity - >=0', () => {
      cy.get('@form').find('#items_0_quantity').type('5');
      cy.get('@form').find('#items_0_quantity').should('have.value', '5');
    });

    it('Rejects Quantity < 0', () => {
      cy.get('@form').find('#items_0_quantity').type('-1');
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      cy.contains('Quantity must be positive').should('be.visible');
    });

    it('Rejects Quantity with alphabets', () => {
      cy.get('@form').find('#items_0_quantity').type('ABC');
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      cy.contains('Quantity must be numeric').should('be.visible');
    });
  });

  // ---------------- Price Field Tests ----------------
  describe('Price Field', () => {
    it('Accepts valid Price - >=0', () => {
      cy.get('@form').find('#items_0_price').type('100');
      cy.get('@form').find('#items_0_price').should('have.value', '100');
    });

    it('Rejects Price < 0', () => {
      cy.get('@form').find('#items_0_price').type('-50');
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      cy.contains('Price must be positive').should('be.visible');
    });

    it('Rejects Price with alphabets', () => {
      cy.get('@form').find('#items_0_price').type('ABC');
      cy.get('@form').find('button[type="submit"]').contains('Save').click();
      cy.contains('Price must be numeric').should('be.visible');
    });
  });

  // ---------------- Item Name Field Tests ----------------
  describe('Item Name Field', () => {
    it('Accepts valid Item Name - any text', () => {
      cy.get('@form').find('#items_0_itemName').type('Test Product');
      cy.get('@form').find('#items_0_itemName').should('have.value', 'Test Product');
    });
  });

  // ---------------- Status Field Tests ----------------
  describe('Status Field', () => {
    it('Accepts valid Status - draft, pending, sent', () => {
      const statuses = ['draft', 'pending', 'sent'];
      
      statuses.forEach(status => {
        cy.get('@form').find('#status').click();
        cy.get('.ant-select-item-option').contains(status.charAt(0).toUpperCase() + status.slice(1)).click();
        cy.get('@form').find('#status').parent().should('contain', status.charAt(0).toUpperCase() + status.slice(1));
      });
    });
  });

  // ---------------- Combined Scenarios ----------------
  describe('Combined Scenarios', () => {
    it('Accepts complete valid form with all required fields', () => {
      // Fill client
      cy.get('@form').find('#rc_select_16').click();
      cy.get('@form').find('#rc_select_16').type('Test Client');
      cy.get('.ant-select-item-option').first().click();

      // Fill number and year (already have default values)
      cy.get('@form').find('#number').should('have.value', '1');
      cy.get('@form').find('#year').should('have.value', '2025');

      // Fill item details
      cy.get('@form').find('#items_0_itemName').type('Test Product');
      cy.get('@form').find('#items_0_description').type('Test Description');
      cy.get('@form').find('#items_0_quantity').type('2');
      cy.get('@form').find('#items_0_price').type('50');

      // Submit form
      cy.get('@form').find('button[type="submit"]').contains('Save').click();

      // Should submit successfully
      cy.get('@form').find('.ant-form-item-explain-error').should('not.exist');
    });

    it('Rejects form with all required fields empty', () => {
      // Clear all required fields
      cy.get('@form').find('#number').clear();
      cy.get('@form').find('#year').clear();
      cy.get('@form').find('#date').clear();
      cy.get('@form').find('#expiredDate').clear();
      cy.get('@form').find('#items_0_itemName').clear();
      cy.get('@form').find('#items_0_quantity').clear();
      cy.get('@form').find('#items_0_price').clear();

      // Submit form
      cy.get('@form').find('button[type="submit"]').contains('Save').click();

      // Should show multiple validation errors
      cy.contains('Client is required').should('be.visible');
      cy.contains('Number is required').should('be.visible');
      cy.contains('Year is required').should('be.visible');
      cy.contains('Date is required').should('be.visible');
      cy.contains('Expire Date is required').should('be.visible');
      cy.contains('Item Name is required').should('be.visible');
      cy.contains('Quantity is required').should('be.visible');
      cy.contains('Price is required').should('be.visible');
    });
  });
});