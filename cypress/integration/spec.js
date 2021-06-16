/// <reference types="cypress" />

it('loads list of users', () => {
  cy.intercept('/users').as('users')
  cy.visit('/')
  cy.wait('@users').its('response.body')
    .should('be.an', 'Array')
    .and('have.length.gt', 5)
    .then(users => {
      cy.get('[data-testid=user]').should('have.length', users.length)
    })
})

it('shows loading indicator', () => {
  cy.intercept('/users', (req) => {
    return Cypress.Promise.delay(1000).then(() => req.continue())
  }).as('users')
  cy.visit('/')
  cy.get('[data-testid=loading]').should('be.visible')
  cy.get('[data-testid=loading]').should('not.exist')
  cy.wait('@users')
})

it('shows mock data', () => {
  cy.intercept('/users', { fixture: 'users.json' }).as('users')
  cy.visit('/')
  cy.get('[data-testid=user]').should('have.length', 3)
})
