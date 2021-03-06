import React from "react";
import { Label, Icon, Popup, List } from "semantic-ui-react";
import { Player } from "../../../common/src/types/types";

interface Props {
    players: Pick<Player, "id" | "name">[]
}
export function GamePlayersLabel({ players }: Props) {
    return (
        <Popup
            on="click"
            trigger={
                <Label color="black" data-cy="players-list-trigger">
                    <Icon name="users" />
                    { players.length } playing
                </Label>
            }
            content={
                <List data-cy="players-list">
                    { players.map(player => (
                        <List.Item key={ player.id }>
                            { player.name }
                        </List.Item>
                    )) }
                </List>
            }
            position="bottom center"
            inverted
        />
    )
}