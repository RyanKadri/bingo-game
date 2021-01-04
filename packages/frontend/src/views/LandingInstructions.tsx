import { Link } from "react-router-dom";
import styles from "./LandingInstructions.module.css"

export function LandingInstructionsView() {
    return (
        <main className={ styles.container }>
            <div className={ styles.card }>
                <h1>Bingo X-TREME</h1>
                <h2>Play with friends online!</h2>
                <Link to="/game/create">Create a Game</Link>
                <article className={ styles.instructions }>
                    <header>The Caller:</header>
                    <ol>
                    <li>If you are the caller, click the "Create a Game" button above</li>
                    <li>On the next screen, set up your board</li>
                    <li>Once you have set up your board, you will get a link to share with your friends</li>
                    </ol>
                    <header>The Players:</header>
                    <ol>
                    <li>Wait for the link from your caller</li>
                    <li>When you click the link, your Bingo card(s) will be generated for you</li>
                    <li>Click on the squares on the board to mark them</li>
                    <li>The game will not detect Bingo for you. Keep an eye on your board and call Bingo when you are done</li>
                    </ol>
                </article>
            </div>
        </main>
    )
}