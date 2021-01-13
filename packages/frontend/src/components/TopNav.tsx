import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon, Input } from "semantic-ui-react";
import { Player } from "../../../common/src/types/board";
import styles from "./TopNav.module.css";

interface Props {
    player?: Player
    onUpdatePlayer: (update: Partial<Player>) => Promise<void>;
}
export function TopNav({ player, onUpdatePlayer }: Props) {

    const [ playerName, setPlayerName ] = useState(player?.name ?? "");
    const [ ackNameUpdate, setAckNameUpdate ] = useState(false);

    useEffect(() => {
        setPlayerName(player?.name ?? "");
    }, [ player?.name ]);

    const onUpdateName = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdatePlayer({ ...player, name: playerName })
            .then(() => {
                setAckNameUpdate(true);
                setTimeout(() => { setAckNameUpdate(false) }, 2000);
            })
    }

    return (
        <nav className={ styles.topNav }>
            <header>Bing.0</header>
            <ul>
                <li>
                    <Link to="/">Instructions</Link>
                </li>
                <li>
                    <Link to="/game/create">Create</Link>
                </li>
            </ul>
            <form className={ styles.nameForm } 
                  onSubmit={ onUpdateName }>
                <Input label="Your Name" value={ playerName } 
                       icon={ ackNameUpdate ? <Icon color="green" name="check"></Icon> : "" }
                       onChange={ (_, data) => setPlayerName(data.value) } />
            </form>
        </nav>
    )
}