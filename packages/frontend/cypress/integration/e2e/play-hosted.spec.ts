
context('Join a Hosted Game', () => {
    it("Logs in and joins a game", () => {
        cy.request({ method: "POST", url: `${Cypress.env("BACKEND_URL")}/games`, body: {
            name: "Cypress Game",
            gameParams: {
                letters: "WALDO",
                rows: 5,
                maxNumber: 75,
                freeCenter: true,
                showBoards: true
            }
        } })
            .then(createResp => {
                cy.visit(`/game/${createResp.body.id}`);
                cy.url()
                    .should("include", "sign-in")

                cy.intercept({ method: "PUT", url: "**/players" })
                    .as("createUser");
                cy.get("#player-name")
                    .type("TestPlayer{enter}");
        
                cy.wait("@createUser")
                    .should(({ response }) => {
                        expect(response.body.name).to.equal("TestPlayer");
                        expect(response.body.id).not.to.be.undefined;
                    });

                cy.intercept({ method: "GET", url: "**/boards/*" })
                    .as("fetchBoard");
                cy.wait("@fetchBoard");
                
                cy.get("[class^=BingoBoard] table th")
                    .should("have.text", "WALDO")

                cy.request({ method: "PATCH", url: `${Cypress.env("BACKEND_URL")}/games`, body: {
                    calledNumbers: [42],
                    id: createResp.body.id
                } }).as("updateBoard")

                cy.contains("Last Picked:")
                    .find("div.label")
                    .should("have.text", "L - 42")
            })

    });

  })
  