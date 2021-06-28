import { mockGame } from "../../utils/mock/game";
import { mockPlayer } from "../../utils/mock/player";

const examplePlayer = mockPlayer({ id: "player-123", name: "Bob Jones", connectionId: "conn-123", games: [] });

context('Create User', () => {
    beforeEach(() => {
        localStorage.setItem("bingo.playerInfo", JSON.stringify(examplePlayer))
        cy.visit('/game/create')
    });
  
    it('Gives form feedback', () => {
        cy.get("#game-name")
            .type("My Game")
        cy.get("#letters")
            .clear()
            .type("BINGOS")
        cy.get("#max-number")
            .should("have.value", 108)
            .type("{uparrow}")
            .should("have.value", 114)
        cy.get("#free-center")
            .should("be.disabled")
        cy.get("[class^='BingoBoard'] table th")
            .should("have.length", 6)
            .should("have.text", "BINGOS")
        cy.get("[class^=BingoBoard] table tbody tr")
            .should("have.length", 6)
    });

    it("Creates a game", () => {
        const gameName = "My Game";
        const gameLetters = "WALDO";
        const gameId = "g1234";
        const maxNumber = 75;

        cy.get("#game-name")
            .type(gameName)
        cy.get("#letters")
            .clear()
            .type(gameLetters)
        cy.get("#max-number")
            .should("have.value", maxNumber);
        
        const expectedParams = {
            letters: gameLetters, 
            rows: 5,
            maxNumber: maxNumber, 
            freeCenter: true,
            showBoards: true
        };

        cy.intercept({ method: "POST", url: "**/games" }, 
            mockGame({ 
                id: gameId, 
                gameParams: expectedParams,
                name: gameName
            })
        ).as("createGame")

        cy.intercept({ method: "GET", url: `**/games/${gameId}` }, 
            mockGame({ id: gameId, gameParams: expectedParams, players: [ examplePlayer ], listeners: [ examplePlayer.connectionId ] })
        ).as("fetchGame")

        cy.contains("Create Game")
            .click();

        cy.wait("@createGame")
            .should(req => {
                expect(req.request.body.gameParams).deep.equals(expectedParams);
                expect(req.request.body.name).equals(gameName)
            })
    });
  
  })
  