import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import { CreateGameView } from './views/CreateGameView';
import { HostGameView } from './views/HostGameView';
import { LandingInstructionsView } from './views/LandingInstructions';
import { JoinGameView } from './views/JoinGameView';
import { PlayGameView } from './views/PlayGameView';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <LandingInstructionsView />
        </Route>
        <Route path="/game/create">
          <CreateGameView />
        </Route>
        <Route path="/game/:gameId/host">
          <HostGameView />
        </Route>
        <Route exact path="/game/:gameId" render={ props => (
          <Redirect to={`/game/${props.match.params.gameId}/join`} />
        )}>
        </Route>
        <Route path="/game/:gameId/join">
          <JoinGameView />
        </Route>
        <Route path="/game/:gameId/board/:boardId">
          <PlayGameView />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
