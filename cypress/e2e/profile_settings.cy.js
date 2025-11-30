describe('Profile Form Tests', () => {
  beforeEach(() => {
    // Log in
    cy.visit('http://localhost:3000/login');
    cy.get('button.login-form-button').click();
    cy.url().should('eq', 'http://localhost:3000/');
    
    // Navigate to profile page
    cy.visit('http://localhost:3000/profile');
  });

  const clickEditAndWaitForForm = () => {
    // Click on Edit button
    cy.get('button.ant-btn-primary').contains('Edit').click();
    
    // Wait for the form to be visible
    cy.get('form.ant-form', { timeout: 5000 }).should('be.visible');
    cy.get('#name', { timeout: 5000 }).should('be.visible');
    cy.get('#surname', { timeout: 5000 }).should('be.visible');
    cy.get('#email', { timeout: 5000 }).should('be.visible');
  };

  describe('First Name Field Tests', () => {
    it('should accept valid first name "John"', () => {
      clickEditAndWaitForForm();
      
      cy.get('#name').clear().type('John');
      cy.get('#name').should('have.value', 'John');

      // Set other required fields
      cy.get('#surname').clear().type('Doe');
      cy.get('#email').clear().type('admin@admin.com');

      // Submit form
      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      // Verify success
      cy.contains('403', { timeout: 10000 }).should('be.visible');
    });

    it('should reject empty first name', () => {
      clickEditAndWaitForForm();
      
      cy.get('#name').clear();
      
      // Verify error message
      cy.contains('Please enter First Name').should('be.visible');

      // Try to submit
      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      // Should still show error
      cy.contains('Please enter First Name').should('be.visible');
    });
  });

  describe('Last Name Field Tests', () => {
    it('should accept valid last name "Doe"', () => {
      clickEditAndWaitForForm();
      
      cy.get('#surname').clear().type('Doe');
      cy.get('#surname').should('have.value', 'Doe');

      // Set other required fields
      cy.get('#name').clear().type('John');
      cy.get('#email').clear().type('john.doe@example.com');

      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should reject empty last name', () => {
      clickEditAndWaitForForm();
      
      cy.get('#surname').clear();
      
      // Verify error message
      cy.contains('Please enter Last Name').should('be.visible');

      // Try to submit
      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Last Name').should('be.visible');
    });
  });

  describe('Email Field Tests', () => {
    it('should accept valid email "john.doe@example.com"', () => {
      clickEditAndWaitForForm();
      
      cy.get('#email').clear().type('admin@admin.com');
      cy.get('#email').should('have.value', 'john.doe@example.com');

      // Set other required fields
      cy.get('#name').clear().type('John');
      cy.get('#surname').clear().type('Doe');

      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should reject empty email', () => {
      clickEditAndWaitForForm();
      
      cy.get('#email').clear();
      
      // Verify error message
      cy.contains('Please enter Email').should('be.visible');

      // Try to submit
      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      // Should still show error
      cy.contains('Please enter Email').should('be.visible');
    });

    it('should reject invalid email without @ and .com', () => {
      clickEditAndWaitForForm();
      
      // Test various invalid email formats
      const invalidEmails = [
        'asas@gma',           // Missing proper domain
        'invalidemail',       // No @ symbol
        'test@domain',        // No .com or domain extension
        '@domain.com',        // Missing local part
        'test.com',           // No @ symbol
        'test@.com'           // Missing domain name
      ];

      invalidEmails.forEach(invalidEmail => {
        cy.get('#email').clear().type(invalidEmail);
        
        // Verify error message for invalid email
        cy.contains('Email is not a valid email').should('be.visible');

        // Set other fields to valid values
        cy.get('#name').clear().type('John');
        cy.get('#surname').clear().type('Doe');

        // Try to submit
        cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
        
        // Should still show email error
        cy.contains('Email is not a valid email').should('be.visible');
      });
    });
  });

  describe('Combined Valid Test', () => {
    it('should submit form with all valid fields', () => {
      clickEditAndWaitForForm();
      
      // Set all fields to valid values
      cy.get('#name').clear().type('John');
      cy.get('#surname').clear().type('Doe');
      cy.get('#email').clear().type('admin@admin.com');

      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });
  });

  describe('Error Clearance Tests', () => {
    it('should clear first name error when valid value is entered', () => {
      clickEditAndWaitForForm();
      
      // First enter invalid value (empty)
      cy.get('#name').clear();
      cy.contains('Please enter First Name').should('be.visible');

      // Then enter valid value
      cy.get('#name').clear().type('John');
      
      // Error message should disappear
      cy.contains('Please enter First Name').should('not.exist');

      // Set other fields
      cy.get('#surname').clear().type('Doe');
      cy.get('#email').clear().type('admin@admin.com');

      // Submit should work now
      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should clear last name error when valid value is entered', () => {
      clickEditAndWaitForForm();
      
      // First enter invalid value (empty)
      cy.get('#surname').clear();
      cy.contains('Please enter Last Name').should('be.visible');

      // Then enter valid value
      cy.get('#surname').clear().type('Doe');
      
      // Error message should disappear
      cy.contains('Please enter Last Name').should('not.exist');

      // Set other fields
      cy.get('#name').clear().type('John');
      cy.get('#email').clear().type('admin@admin.com');

      // Submit should work now
      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should clear email error when valid value is entered after empty', () => {
      clickEditAndWaitForForm();
      
      // First enter invalid value (empty)
      cy.get('#email').clear();
      cy.contains('Please enter Email').should('be.visible');

      // Then enter valid value
      cy.get('#email').clear().type('john.doe@example.com');
      
      // Error message should disappear
      cy.contains('Please enter Email').should('not.exist');

      // Set other fields
      cy.get('#name').clear().type('John');
      cy.get('#surname').clear().type('Doe');

      // Submit should work now
      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });

    it('should clear email error when valid value is entered after invalid format', () => {
      clickEditAndWaitForForm();
      
      // First enter invalid value (invalid format)
      cy.get('#email').clear().type('asas@gma');
      cy.contains('Email is not a valid email').should('be.visible');

      // Then enter valid value
      cy.get('#email').clear().type('admin@admin.com');
      
      // Error message should disappear
      cy.contains('Email is not a valid email').should('not.exist');

      // Set other fields
      cy.get('#name').clear().type('John');
      cy.get('#surname').clear().type('Doe');

      // Submit should work now
      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      cy.contains('Request success').should('be.visible');
    });
  });

  describe('Multiple Invalid Fields Test', () => {
    it('should show errors for all empty required fields', () => {
      clickEditAndWaitForForm();
      
      // Clear all required fields
      cy.get('#name').clear();
      cy.get('#surname').clear();
      cy.get('#email').clear();

      // Verify all error messages are shown
      cy.contains('Please enter First Name').should('be.visible');
      cy.contains('Please enter Last Name').should('be.visible');
      cy.contains('Please enter Email').should('be.visible');

      // Try to submit
      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      // Should still show all errors
      cy.contains('Please enter First Name').should('be.visible');
      cy.contains('Please enter Last Name').should('be.visible');
      cy.contains('Please enter Email').should('be.visible');
    });

    it('should show mixed errors for empty names and invalid email', () => {
      clickEditAndWaitForForm();
      
      // Clear name fields and set invalid email
      cy.get('#name').clear();
      cy.get('#surname').clear();
      cy.get('#email').clear().type('asas@gma');

      // Verify all error messages are shown
      cy.contains('Please enter First Name').should('be.visible');
      cy.contains('Please enter Last Name').should('be.visible');
      cy.contains('Email is not a valid email').should('be.visible');

      // Try to submit
      cy.get('button.ant-btn-primary').contains('Save').click({ force: true });
      
      // Should still show all errors
      cy.contains('Please enter First Name').should('be.visible');
      cy.contains('Please enter Last Name').should('be.visible');
      cy.contains('Email is not a valid email').should('be.visible');
    });
  });
});