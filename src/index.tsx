import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import {JitsiManager} from "./utils/JitsiManager";

console.log('[process.env.REACT_APP_DISABLE_LIVE_RELOAD]: ', process.env.REACT_APP_DISABLE_LIVE_RELOAD);
if (process.env.REACT_APP_DISABLE_LIVE_RELOAD === '1') {
    const WS = window.WebSocket;
    const hotReloadUrl = `ws://localhost:${process.env.PORT}/sockjs-node`;
    // @ts-ignore
    window.WebSocket = function (s: string, ...rest): WebSocket {
        if (s === hotReloadUrl) {
            console.info(`[DEV NOTICE] Live Reload Has Been Disabled. URL: ${hotReloadUrl}`);
            return {} as WebSocket;
        } else {
            // Pass through other usage of sockets
            return new WS(s, ...rest);
        }
    };
}

JitsiManager.loadExternalApi()
    .then(() => {
        ReactDOM.render(
            <React.StrictMode>
                <Provider store={store}>
                    <App />
                </Provider>
            </React.StrictMode>,
            document.getElementById('root')
        );
    })

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
