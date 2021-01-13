import { Link } from "react-router-dom";
import styles from "./LandingInstructions.module.css"
import { Card, Button, Header, Message } from "semantic-ui-react";

export function LandingInstructionsView() {
    return (
        <main className={ styles.container }>
            <Card className={ styles.card }>
                <Card.Content>
                    <Header as="h1">
                        Bingo Online
                    </Header>
                    <Link to="/game/create">
                        <Button primary>
                            Create a Game
                        </Button>
                    </Link>
                    <Message info>
                        <Message.Header as="header">
                            Caller Instructions
                        </Message.Header>
                        <Message.List>
                            <Message.Item>If you are the caller, click the "Create a Game" button above</Message.Item>
                            <Message.Item>On the next screen, set up your board</Message.Item>
                            <Message.Item>Once you have set up your board, you will get a link to share with your friends</Message.Item>
                        </Message.List>
                        <Message.Header as="header" className={ styles.header }>Player Instructions</Message.Header>
                        <Message.List>
                            <Message.Item>Wait for the link from your caller</Message.Item>
                            <Message.Item>When you click the link, your Bingo card(s) will be generated for you</Message.Item>
                            <Message.Item>Click on the squares on the board to mark them</Message.Item>
                            <Message.Item>The game will not detect Bingo for you. Keep an eye on your board!</Message.Item>
                        </Message.List>
                    </Message>
                </Card.Content>
            </Card>
        </main>
    )
}