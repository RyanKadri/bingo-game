import { mockBoard } from "../../utils/mock/board";
import { mockGame } from "../../utils/mock/game";
import { mockPlayer } from "../../utils/mock/player";

const exampleHost = mockPlayer({ id: "player-1234", name: "Bob Hosterson", connectionId: "conn-1234", games: [] });
const examplePlayer = mockPlayer({ id: "player-4321", name: "Joe O'Player", connectionId: "conn-4321", games: [] });
const gameId = "g1234";
const boardId = "b1234"

context('Play game', () => {
    beforeEach(() => {
        localStorage.setItem("bingo.playerInfo", JSON.stringify(examplePlayer))
    });

    it("Joins a game and generates a new baord", () => {

        const mockedGame = mockGame({ 
            id: gameId,
            name: "Test Game", 
            gameParams: { letters: "WALDO" }, 
            players: [ exampleHost, examplePlayer ], 
            listeners: [ exampleHost.connectionId, examplePlayer.connectionId ]
        });

        const mockedBoard = mockBoard({
            id: boardId,
            letters: "WALDO"
        });

        cy.intercept({ method: "GET", url: `**/games/${gameId}` }, 
            mockedGame
        ).as("fetchGame");

        cy.intercept({ method: "POST", url: `**/games/${gameId}/boards` }, 
            mockedBoard
        ).as("createBoard");

        cy.visit(`/game/${gameId}`);

        cy.wait("@createBoard")
            .its("request.body")
            .should("deep.equal", mockedGame.gameParams)


    })
  
    it("Displays a player view properly", () => {
        
        const mockedGame = mockGame({ 
            id: gameId,
            name: "Test Game", 
            gameParams: { letters: "WALDO" }, 
            players: [ exampleHost, examplePlayer ], 
            listeners: [ exampleHost.connectionId, examplePlayer.connectionId ]
        });
        const mockedBoard = mockBoard({
            id: boardId,
            letters: "WALDO"
        });

        cy.intercept({ method: "GET", url: `**/games/${gameId}` }, 
            mockedGame
        ).as("fetchGame");

        cy.intercept({ method: "GET", url: `**/boards/${boardId}` }, 
            mockedBoard
        ).as("fetchGame");

        cy.visit(`/game/${gameId}/board/${boardId}`);
        cy.get('[data-cy="game-title"]')
            .should("contain.text", mockedGame.name)

        cy.get('[class^="BingoBoard"] table th')
            .should("have.text", mockedBoard.letters)

    });

  })
  