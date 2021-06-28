
context('Host a game', () => {
    beforeEach(() => {
        cy.visit(`/`)
    });
  
    it("Logs in and creates a game", () => {
        cy.intercept({ method: "PUT", url: "**/players" })
            .as("createUser");
        cy.get("#player-name")
            .type("Ryan{enter}");

        cy.wait("@createUser")
            .should(({ response }) => {
                expect(response.body.name).to.equal("Ryan");
                expect(response.body.id).not.to.be.undefined;
            });

        cy.contains("Create a Game")
            .click();

        cy.get("#game-name")
            .type("Cypress Game");

        cy.get("#letters")
            .clear()
            .type("WALDO")
        
        cy.intercept({ method: "POST", url: "**/games" })
            .as("createGame");
        cy.intercept({ method: "GET", url: "**/games/*" })
            .as("fetchGame");

        cy.contains("Create Game")
            .click();

        cy.wait("@createGame")
            .should(({ request, response }) => {
                expect(request.body.name).to.equal("Cypress Game");
                expect(request.body.gameParams.letters).to.equal("WALDO");
                expect(response.statusCode).to.equal(200);
            });

        cy.wait("@fetchGame")
            .its("response.statusCode")
            .should("equal", 200);
    });

  })
  