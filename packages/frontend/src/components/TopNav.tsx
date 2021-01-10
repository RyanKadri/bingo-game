import React from "react";
import { Link } from "react-router-dom";
import styles from "./TopNav.module.css";

export function TopNav() {
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
        </nav>
    )
}