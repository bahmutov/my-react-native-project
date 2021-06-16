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
