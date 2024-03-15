/// <reference types="cypress" />
describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://localhost:4173/')
    cy.get('#email').type("ENGprovider")
    cy.get('#password').type("ENG")
    
    cy.get('.col-4 > .hydrated').click()
    for (var i=0; i < 50; i++) {
    cy.get('.nav-pills > :nth-child(1) > .nav-link > .fas').click()
    cy.get(':nth-child(4) > .nav-link').click()}
  })
})
