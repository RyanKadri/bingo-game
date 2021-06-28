import { mockPlayer } from "../../utils/mock/player"

context('Create User', () => {
    beforeEach(() => {
      cy.visit('/')
    })
  
    // https://on.cypress.io/interacting-with-elements
  
    it('Populates your name with sign-on value', () => {

      cy.intercept({ method: "PUT", url: "**/players" }, 
        mockPlayer({ name: "Bob Jones" })
      ).as("createUser")

      // https://on.cypress.io/type
      cy.contains('Name')
        .invoke("attr", "for")
        .then(id => { cy.get(`#${id}`) })
        .type('Bob Jones').should('have.value', 'Bob Jones')
  
        // .type() with special character sequences
        .type('{enter}')

      cy.wait("@createUser").should(({ request }) => {
        expect(request.body.name).to.contain("Bob Jones")
      })
  
      cy.get('#player-name')
        // Ignore error checking prior to type
        // like whether the input is visible or disabled
        .should('have.value', 'Bob Jones')
    })
  
  })
  