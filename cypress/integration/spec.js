/// <reference types="cypress" />

it('loads a list of users', () => {
  cy.visit('/')
  cy.get('[data-testid=user]')
    .should('have.length.gt', 3)
})

it('spy on the network load', () => {
  cy.intercept('/users').as('users')
  cy.visit('/')
  cy.wait('@users').its('response.body')
    .should('be.an', 'Array')
    .and('have.length.gt', 5)
    .then(users => {
      cy.get('[data-testid=user]')
        .should('have.length', users.length)
    })
})

it('shows loading indicator', () => {
  // slow down the response by 1 second
  // https://on.cypress.io/intercept
  cy.intercept('/users', (req) => {
    // use bundled Bluebird library
    // which has utility method .delay
    // https://on.cypress.io/promise
    return Cypress.Promise.delay(1000).then(() => req.continue())
  }).as('users')
  cy.visit('/')
  cy.get('[data-testid=loading]').should('be.visible')
  cy.get('[data-testid=loading]').should('not.exist')
  cy.wait('@users')
})

it('shows the loading indicator', () => {
  // slow down the response by 1 second
  // https://on.cypress.io/intercept
  cy.intercept('/users', (req) => {
    return req.continue(res => res.setDelay(1000))
  }).as('users')
  cy.visit('/')
  // the loading indicator should be visible at first
  cy.get('[data-testid=loading]').should('be.visible')
  // the disappear
  cy.get('[data-testid=loading]').should('not.exist')
  cy.wait('@users')
})

it('shows mock data', () => {
  cy.intercept('/users', { fixture: 'users.json' })
  cy.visit('/')
  cy.get('[data-testid=user]').should('have.length', 3)
})

it('shows loading indicator (mock)', () => {
  cy.intercept('/users', {
    fixture: 'users.json', delay: 1000
  }).as('users')
  cy.visit('/')
  cy.get('[data-testid=loading]').should('be.visible')
  cy.get('[data-testid=loading]').should('not.exist')
  cy.get('[data-testid=user]').should('have.length', 3)
})

it('handles network error after 1 second', () => {
  cy.intercept('/users', (req) => {
    return Cypress.Promise.delay(1000)
      .then(() => req.reply({ forceNetworkError: true }))
  })
  // observe the application's behavior
  // in our case, the app simply logs the error
  cy.visit('/', {
    onBeforeLoad(win) {
      cy.spy(win.console, 'error').as('logError')
    },
  })
  cy.get('[data-testid=loading]').should('be.visible')
  // confirm the loading indicator goes away
  cy.get('[data-testid=loading]').should('not.exist')
  cy.get('@logError').should('have.been.called')
})
