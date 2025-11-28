describe('Add New Client Form - All Fields', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('button.login-form-button').click();
    cy.url().should('eq', 'http://localhost:3000/');
    cy.visit('http://localhost:3000/customer');
    cy.contains('Add New Client').click({ force: true });

    // Alias the visible form
    cy.get('.BottomCollapseBox form:visible').as('form');
  });

  // ---------------- Name ----------------
  it('Accepts valid Name', () => {
    cy.get('@form').find('#name').type('John Smith', { force: true });
    cy.get('@form').find('button[type="submit"]').click({ force: true });
    // Add assertion: check success notification or new client appears
  });

  it('Rejects empty Name', () => {
    cy.get('@form').find('#name').clear({ force: true });
    cy.get('@form').find('button[type="submit"]').click({ force: true });
    // Add assertion: check error message for required Name
  });

  // ---------------- Country ----------------
  it('Accepts valid Country', () => {
    cy.get('@form').find('#country').type('Canada{enter}', { force: true });
    cy.get('@form').find('button[type="submit"]').click({ force: true });
    // Optional: assert success
  });

  // ---------------- Address ----------------
  it('Accepts valid Address', () => {
    cy.get('@form').find('#address').type('123 Main St', { force: true });
    cy.get('@form').find('button[type="submit"]').click({ force: true });
    // Optional: assert success
  });

  // ---------------- Phone ----------------
  it('Accepts valid Phone', () => {
    cy.get('@form').find('#phone').type('+1 123 456 789', { force: true });
    cy.get('@form').find('button[type="submit"]').click({ force: true });
    // Optional: assert success
  });

  // ---------------- Email ----------------
  it('Accepts valid Email', () => {
    cy.get('@form').find('#email').type('john.smith@example.com', { force: true });
    cy.get('@form').find('button[type="submit"]').click({ force: true });
    // Optional: assert success
  });

  it('Rejects Email without @', () => {
    cy.get('@form').find('#email').type('john.smithexample.com', { force: true });
    cy.get('@form').find('button[type="submit"]').click({ force: true });
    // Optional: assert error message about invalid email
  });

  it('Rejects Email without .', () => {
    cy.get('@form').find('#email').type('john@smithexamplecom', { force: true });
    cy.get('@form').find('button[type="submit"]').click({ force: true });
    // Optional: assert error message about invalid email
  });

  it('Accepts empty Email', () => {
    cy.get('@form').find('#email').clear({ force: true });
    cy.get('@form').find('button[type="submit"]').click({ force: true });
    // Optional: assert success
  });
});
