import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "semantic-ui-react";
import { Player } from "../../../common/src/types/board";
import styles from "./TopNav.module.css";

interface Props {
    player?: Player
    onUpdatePlayer: (update: Partial<Player>) => void;
}
export function TopNav({ player, onUpdatePlayer }: Props) {

    const [playerName, setPlayerName] = useState(player?.name ?? "");
    useEffect(() => {
        setPlayerName(player?.name ?? "");
    }, [ player?.name ]);
    
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
                  onSubmit={ e => { e.preventDefault(); onUpdatePlayer(({ ...player, name: playerName })) }}>
                <Input label="Your Name" value={ playerName }
                       onChange={ (_, data) => setPlayerName(data.value) } />
            </form>
        </nav>
    )
}