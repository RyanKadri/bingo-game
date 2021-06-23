import { mockGame } from "../../utils/mock/game";
import { mockPlayer } from "../../utils/mock/player";

const examplePlayer = mockPlayer({ id: "player-123", name: "Bob Jones", connectionId: "conn-123", games: [] });
const gameId = "g1234";

context('Create User', () => {
    beforeEach(() => {
        localStorage.setItem("bingo.playerInfo", JSON.stringify(examplePlayer))
        cy.visit(`/game/${gameId}/host`)
    });
  
    it("Displays a game properly", () => {
        const gameName = "My Game";
        const gameLetters = "WALDO";
        const maxNumber = 75;

        const expectedParams = {
            letters: gameLetters, 
            rows: 5,
            maxNumber: maxNumber, 
            freeCenter: true,
            showBoards: true
        };

        cy.intercept({ method: "GET", url: `**/games/${gameId}` }, 
            mockGame({ 
                id: gameId,
                name: gameName, 
                gameParams: expectedParams, 
                players: [ examplePlayer ], 
                listeners: [ examplePlayer.connectionId ]
            })
        ).as("fetchGame");

        cy.contains(/Hosting \".*?\"/)
            .should("have.text", `Hosting "${gameName}"`);

        cy.get("[class^='BingoBoard'] table tr th:first-of-type")
            .should("have.text", gameLetters)

        cy.get('[data-cy="players-list-trigger"]')
            .should("have.text", "1 playing")
            .click()
            .get('[data-cy="players-list"]')
            .should("have.text", examplePlayer.name)
            
        cy.contains("Last Picked:")
            .find("div")
            .should("contain.text", "-") // This might be a bit silly

        cy.get("[class^='BingoBoard'] table tr td:last-of-type")
            .should("have.length", expectedParams.letters.length)
            .and("have.text", ["15", "30", "45", "60", "75"].join("")) // This might be lazy
    });

    it("Properly calls numbers", () => {
        const mockedGame = mockGame({ 
            id: gameId,
            players: [ examplePlayer ], 
            listeners: [ examplePlayer.connectionId ],
            gameParams: {
                letters: "WALDO"
            }
        });

        cy.intercept({ method: "GET", url: `**/games/${gameId}` }, 
            mockedGame
        ).as("fetchGame");

        cy.intercept({ method: "PATCH", url: `**/games` }, req => {
            req.reply(req.body);
        }).as("callNumber")

        // Hack to influence the next called number
        cy.window().then(window => {
            window.nextRandom = 10;
        });

        cy.contains("Next Number")
            .click();

        cy.wait("@callNumber")
            .its("request.body.calledNumbers")
            .should("deep.equal", [11]);

        cy.get('[data-cy="last-number-display"]')
            .should("contain.text", "W - 11");

        cy.get('[data-cy="call-history"]')
            .should("have.length", 1)
            .should("have.text", "W - 11")
    })
  
  })
  