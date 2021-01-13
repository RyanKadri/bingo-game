import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Form, Header, Message } from "semantic-ui-react";
import { Player } from "../../../common/src/types/board";
import styles from "./SignInView.module.css";

interface Props {
    onUpdatePlayer(update: Partial<Player>): Promise<void>;
}
export function SignInView({ onUpdatePlayer }: Props) {
    const [ playerName, setPlayerName ] = useState("");
    const { search } = useLocation();
    const history = useHistory();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const searchParams = new URLSearchParams(search);
        await onUpdatePlayer({ name: playerName });
        history.push(searchParams.get("target") ?? "/");
    }

    return (
        <main className={ styles.container }>
            <div className={ styles.signInBox }>
                <Header>Sign In</Header>
                <Form onSubmit={ onSubmit }>
                    <Message info>
                        Hi. You seem to be new here. Please enter your name so you can play Bingo!
                    </Message>
                    <Form.Input label="Name" value={ playerName } 
                        onChange={(_, e) => setPlayerName(e.value)} />
                    <Form.Button primary>Start Playing</Form.Button>
                </Form>
            </div>
        </main>
    )
}