import classNames from "classnames";
import React, { useState } from "react";
import { Input, Popup } from "semantic-ui-react";
import styles from "./JoinGameLink.module.css";

interface Props {
    gameId: string;
    className?: string;
}
export function JoinGameLink({ gameId, className }: Props) {

    const [ copyTooltip, setCopyTooltip ] = useState(false);
    const joinableLink = `${window.location.origin}/game/${gameId}`;

    const onCopyVisitLink = () => {
        setCopyTooltip(true);
        navigator.clipboard.writeText(joinableLink)
            .then(console.log)
            .catch(console.error);
        setTimeout(() => setCopyTooltip(false), 2000)
    }

    return (
        <Popup
            trigger={
                <Input id="game-link"
                    type="text" size="small"
                    className={ classNames(styles.linkInput, className) }
                    value={ joinableLink }
                    action={{
                        color: "blue",
                        icon: "copy",
                        onClick: onCopyVisitLink
                    }} />
            }
            open={ copyTooltip }
            on="click"
            onOpen={ onCopyVisitLink }
            onClose={ () => setCopyTooltip(false) }
            content="Copied"
            inverted
            position="right center"
        />
    )
}