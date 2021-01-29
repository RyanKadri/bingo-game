import classnames from "classnames";
import React, { useState } from "react";
import { Form, Input, Label } from "semantic-ui-react";
import styles from "./JoinGameLink.module.css";

interface Props {
    gameId: string;
}
export function JoinGameLink({ gameId }: Props) {

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
        <Form.Field>
            <Input 
                type="text" size="small"
                className={ styles.linkInput }
                value={ joinableLink }
                action={{
                    color: "blue",
                    icon: "copy",
                    onClick: onCopyVisitLink
                }} />
            <Label pointing="left" color="black" 
                    className={ classnames(styles.copyLabel, { [ styles.show ]: copyTooltip }) }>
                Copied
            </Label>
        </Form.Field>
    )
}