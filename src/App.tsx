import React from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import './App.css';
import {Room} from "./features/room/Room";
import {
    BrowserRouter as Router,
    Route,
    Switch,
} from "react-router-dom";
import {Home} from "./features/home/Home";
import {PUBLIC_URL} from "./constants";

const ExampleApp = () => {
    return (
        <div className="App">
            <Room />
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <Counter />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <span>
          <span>Learn </span>
          <a
              className="App-link"
              href="https://reactjs.org/"
              target="_blank"
              rel="noopener noreferrer"
          >
            React
          </a>
          <span>, </span>
          <a
              className="App-link"
              href="https://redux.js.org/"
              target="_blank"
              rel="noopener noreferrer"
          >
            Redux
          </a>
          <span>, </span>
          <a
              className="App-link"
              href="https://redux-toolkit.js.org/"
              target="_blank"
              rel="noopener noreferrer"
          >
            Redux Toolkit
          </a>
          ,<span> and </span>
          <a
              className="App-link"
              href="https://react-redux.js.org/"
              target="_blank"
              rel="noopener noreferrer"
          >
            React Redux
          </a>
        </span>
            </header>
        </div>
    );
}

function App() {
  return (
      <Router basename={PUBLIC_URL}>
        <Switch>
            <Route exact path={["/", "/home"]} component={Home}/>
            <Route exact path="/example-app" component={ExampleApp} />
            <Route path="/:roomName" component={Room} />
        </Switch>
      </Router>
  );
}

export default App;
