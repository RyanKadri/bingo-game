import ky from 'ky';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import "semantic-ui-css/semantic.min.css";
import { Player } from '../../common/src/types/types';
import './App.css';
import { GAWrapper } from './components/Analytics';
import { TopNav } from './components/TopNav';
import { BingoEventService } from './services/websocket-events';
import { config } from './utils/config';
import { CreateGameView } from './views/CreateGameView';
import { HostGameView } from './views/HostGameView/HostGameView';
import { JoinGameView } from './views/JoinGameView';
import { LandingInstructionsView } from './views/LandingInstructions';
import { PlayGameView } from './views/PlayGameView';
import { SignInView } from './views/SignInView';

const eventService = new BingoEventService();
const playerInfoKey = "bingo.playerInfo";

function App() {

  const [ player, setPlayer ] = useState<Player | undefined>(undefined);
  const hasPlayer = localStorage.getItem(playerInfoKey) !== null;

  useEffect(() => {
    const storedPlayerInfo = localStorage.getItem(playerInfoKey);
    if(storedPlayerInfo) {
      const storedPlayer: Player = JSON.parse(storedPlayerInfo);
      setPlayer(storedPlayer);
    }
    window.addEventListener("beforeunload", () => {
      eventService.disconnect();
    });
    eventService.connect()
  }, []);

  useEffect(() => {
    if(player && player.id) {
      eventService.connect()
        .then(() => {
          eventService.registerPlayer(player.id);
        })
    }
  }, [ player ])

  const onUpdatePlayer = async (update: Partial<Player>) => {
    if(!update.id || update.name !== player?.name) {
      const resp = await ky.put(`${config.backend}/players`, {
        json: update
      }).json<Player>()
      localStorage.setItem(playerInfoKey, JSON.stringify(resp))
      setPlayer(resp)
    }
  }

  return (
    <BrowserRouter>
      <GAWrapper>
        { hasPlayer && <TopNav onUpdatePlayer={ onUpdatePlayer } player={ player } /> }
        { !hasPlayer && (
          <Switch>
            <Route path="/sign-in">
              <SignInView onUpdatePlayer={ onUpdatePlayer } />
            </Route>
            <Route path="/">
              <Redirect to={{ pathname:"/sign-in", search: `target=${window.location.pathname}` }} />
            </Route>
          </Switch>
        ) }
        { hasPlayer && (
          <Switch>
            <Route exact path="/">
              <LandingInstructionsView />
            </Route>
            <Route path="/game/create">
              <CreateGameView />
            </Route>
            <Route path="/game/:gameId/host">
              <HostGameView eventService={ eventService } player={ player } />
            </Route>
            <Route exact path="/game/:gameId" render={ props => (
              <Redirect to={`/game/${props.match.params.gameId}/join`} />
            )}>
            </Route>
            <Route path="/game/:gameId/join">
              <JoinGameView />
            </Route>
            <Route path="/game/:gameId/board/:boardId">
              <PlayGameView eventService={ eventService } player={ player } />
            </Route>
          </Switch>
        )}
      </GAWrapper>
    </BrowserRouter>
  );
}

export default App;
