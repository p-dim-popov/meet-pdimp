import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import {JitsiManager} from "./utils/JitsiManager";
import {Alert, CircularProgress } from '@mui/material';
import { CenteredBox } from './components';
import {Helmet} from "react-helmet";

declare global {
    interface Window {
        pdimp: any;
    }
}
window.pdimp = {};

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

const root = document.getElementById('root');
ReactDOM.render(
    (
        <React.StrictMode>
            <Helmet>
                <title>{`Loading | ${process.env.REACT_APP_DOCUMENT_TITLE_BASE}`}</title>
            </Helmet>
            <CenteredBox>
                <CircularProgress/>
            </CenteredBox>
        </React.StrictMode>
    ),
    root
);

JitsiManager.loadExternalApi()
    .then(() => {
        ReactDOM.render(
            (
                <React.StrictMode>
                    <Helmet>
                        <title>{process.env.REACT_APP_DOCUMENT_TITLE_BASE}</title>
                    </Helmet>
                    <Provider store={store}>
                        <App/>
                    </Provider>
                </React.StrictMode>
            ),
            root
        );
    })
    .catch((error) => {
        ReactDOM.render(
            (
                <React.StrictMode>
                    <Helmet>
                        <title>{`Error | ${process.env.REACT_APP_DOCUMENT_TITLE_BASE}`}</title>
                    </Helmet>
                    <CenteredBox>
                        <Alert severity="error">Jitsi could not load correctly!</Alert>
                    </CenteredBox>
                </React.StrictMode>
            ),
            root
        );
    })

// eslint-disable-next-line no-self-compare
// if ('DEBUG' === 'DEBUG') {
//     (window as any).pdimp = {};
// }

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
