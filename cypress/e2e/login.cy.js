describe('Login Form Test Cases - Separate for Each Test Data', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login', { timeout: 10000 }); // increased timeout
    cy.get('form#normal_login', { timeout: 10000 }).should('be.visible');
  });

  const fillForm = (email, password) => {
    if (email !== null && email !== '') {
      cy.get('#normal_login_email', { timeout: 10000 }).clear().type(email);
    } else if (email === '') {
      cy.get('#normal_login_email', { timeout: 10000 }).clear(); // just clear, don’t type empty string
    }

    if (password !== null && password !== '') {
      cy.get('#normal_login_password', { timeout: 10000 }).clear().type(password);
    } else if (password === '') {
      cy.get('#normal_login_password', { timeout: 10000 }).clear(); // just clear
    }
  };

  const submitForm = () => {
    cy.get('button.login-form-button', { timeout: 10000 }).click();
  };

  // -----------------------
  // Email Tests
  // -----------------------
  it('Email - Valid: should accept "admin@admin.com" with correct password', () => {
    fillForm('admin@admin.com', 'admin123');
    submitForm();
    cy.url({ timeout: 10000 }).should('eq', 'http://localhost:3000/');
  });

  it('Email - Invalid Empty: should reject empty email', () => {
    fillForm('', 'admin123');
    submitForm();
    cy.contains('Please enter Email', { timeout: 10000 }).should('be.visible');
  });

  it('Email - Invalid Wrong Format: should reject "userexample.com"', () => {
    fillForm('userexample.com', 'Wrongpass');
    submitForm();
    cy.contains('Email is not a valid email', { timeout: 10000 }).should('be.visible');
  });

  it('Email - Invalid No .com: should reject "user@example"', () => {
    fillForm('user@example', 'Wrongpass');
    submitForm();
    cy.contains('Email is not a valid email', { timeout: 10000 }).should('be.visible');
  });

  it('Email - Invalid No @: should reject "userexample.com"', () => {
    fillForm('userexample.com', 'Wrongpass');
    submitForm();
    cy.contains('Email is not a valid email', { timeout: 10000 }).should('be.visible');
  });

  // -----------------------
  // Password Tests
  // -----------------------
  it('Password - Valid: should accept "admin123" with correct email', () => {
    fillForm('admin@admin.com', 'admin123');
    submitForm();
    cy.url({ timeout: 10000 }).should('eq', 'http://localhost:3000/');
  });

  it('Password - Invalid Empty: should reject empty password', () => {
    fillForm('admin@admin.com', '');
    submitForm();
    cy.contains('Please enter Password', { timeout: 10000 }).should('be.visible');
  });

  it('Password - Invalid Wrong: should reject "Wrongpass"', () => {
    fillForm('admin@admin.com', 'Wrongpass');
    submitForm();
    cy.contains('Invalid credentials', { timeout: 10000 }).should('be.visible');
  });
});
