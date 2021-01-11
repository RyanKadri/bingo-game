import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import "semantic-ui-css/semantic.min.css"
import { CreateGameView } from './views/CreateGameView';
import { HostGameView } from './views/HostGameView';
import { LandingInstructionsView } from './views/LandingInstructions';
import { JoinGameView } from './views/JoinGameView';
import { PlayGameView } from './views/PlayGameView';
import { TopNav } from './components/TopNav';
import { BingoEventService } from './services/websocket-events';

const eventService = new BingoEventService();

function App() {
  return (
    <BrowserRouter>
      <TopNav></TopNav>
      <Switch>
        <Route exact path="/">
          <LandingInstructionsView />
        </Route>
        <Route path="/game/create">
          <CreateGameView />
        </Route>
        <Route path="/game/:gameId/host">
          <HostGameView eventService={ eventService } />
        </Route>
        <Route exact path="/game/:gameId" render={ props => (
          <Redirect to={`/game/${props.match.params.gameId}/join`} />
        )}>
        </Route>
        <Route path="/game/:gameId/join">
          <JoinGameView />
        </Route>
        <Route path="/game/:gameId/board/:boardId">
          <PlayGameView eventService={ eventService } />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
