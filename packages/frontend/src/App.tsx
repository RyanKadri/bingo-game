import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import { CreateGameView } from './views/CreateGameView';
import { LandingInstructionsView } from './views/LandingInstructions';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <LandingInstructionsView />
        </Route>
        <Route path="/create">
          <CreateGameView />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
