import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {JitsiManager} from "../utils/JitsiManager";
import {AppThunk, RootState} from "./store";
import {JitsiExternalApiConference, JitsiExternalApiConferences} from "../features/JitsiExternalApiConference";

export enum ConferenceStatus {
    None= 'none',
    Loading = 'loading',
    Idle = 'idle',
    Failed = 'failed',
}

export interface ConferenceState {
    status: ConferenceStatus;
    capturedEvents: { [key: string]: any[] };
    mainConferenceIndex: number|null;
}

const initialState: ConferenceState = {
    status: ConferenceStatus.None,
    capturedEvents: {},
    mainConferenceIndex: null,
};

export enum ConferenceErrorType {
    ConferenceExists= 'conference_exists',
    AlreadyLoading = 'already_loading',
}

export class ConferenceError extends Error {
    constructor(public type: ConferenceErrorType, message?: string) {
        super(message);
    }
}

export const createConferenceAsync = createAsyncThunk<
    any,
    { roomName: string },
    {
        state: RootState,
        rejectError: ConferenceError,
    }>(
    'conference/create',
    async ({ roomName }, thunkAPI) => {
        const conferenceIndex = thunkAPI.getState().conference.mainConferenceIndex;
        if (conferenceIndex) {
            await JitsiExternalApiConferences[conferenceIndex]?.get?.();
        }
    }
);

// const unregisterHandlers = (state: ConferenceState) => {
//     state.handlers.forEach((handlers, eventName) => {
//         handlers?.forEach?.((handler) => {
//             state.api.removeEventListener(eventName, handler)
//         })
//     })
// }

const ensureClearedJitsiMeetDivIsInBody = () => {
    const jitsiMeetDiv = Object.assign(
        document.getElementById('jitsi-meet') ?? document.createElement('div'), {
            id: 'jitsi-meet',
            innerHTML: '',
        } as HTMLDivElement);

    jitsiMeetDiv.style.width = '100vw';
    jitsiMeetDiv.style.height = '100vh';
    jitsiMeetDiv.style.maxWidth = '100%';
    jitsiMeetDiv.style.overflow = "hidden";

    if (!document.body.contains(jitsiMeetDiv)) {
        document.body.appendChild(jitsiMeetDiv);
    }
}

export const conferenceSlice = createSlice({
    name: 'conference',
    initialState,
    reducers: {
        on: (state, action: PayloadAction<{ eventName: string, args: any }>) => {
            if (!state.capturedEvents[action.payload.eventName]) {
                state.capturedEvents[action.payload.eventName] = [];
            }
            state.capturedEvents[action.payload.eventName].push(action.payload.args);
        },
        exit: (state) => {
            if (state.mainConferenceIndex === null) return;

            JitsiExternalApiConferences[state.mainConferenceIndex].dispose();
            JitsiExternalApiConferences.splice(state.mainConferenceIndex, 1);
            state.status = ConferenceStatus.None;
            state.capturedEvents = {};
            state.mainConferenceIndex = null;
            ensureClearedJitsiMeetDivIsInBody();
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createConferenceAsync.pending, (state, action) => {
                // Check this if we want only one conference to exist;
                if (state.mainConferenceIndex !== null) return;

                ensureClearedJitsiMeetDivIsInBody();

                state.mainConferenceIndex = JitsiExternalApiConferences.push(new JitsiExternalApiConference()) - 1;
                JitsiExternalApiConferences[state.mainConferenceIndex].setPromise(
                        new Promise((resolve, reject) => {
                            const options = JitsiManager.getExternalApiOptions(action.meta.arg.roomName, resolve);

                            if (state.mainConferenceIndex === null) {
                                return reject('[pdimp]: Main conference index is null!');
                            }

                            JitsiExternalApiConferences?.[state.mainConferenceIndex]
                                ?.setInstance(new JitsiManager.ExternalApiClass(JitsiManager.DOMAIN, options));
                }));

                state.status = ConferenceStatus.Loading;
            })
            .addCase(createConferenceAsync.fulfilled, (state, action) => {
                state.status = ConferenceStatus.Idle;
            })
            .addCase(createConferenceAsync.rejected, (state, action) => {
                state.status = ConferenceStatus.Failed;
            });
    },
})

export const listenFor = (eventName: string): AppThunk => async (dispatch, getState) => {
    const {conference: {mainConferenceIndex}} = getState();
    if (mainConferenceIndex === null) return;

    if (!JitsiExternalApiConferences[mainConferenceIndex]) return;

    const api = await JitsiExternalApiConferences[mainConferenceIndex].get();

    if (JitsiExternalApiConferences[mainConferenceIndex].listeners.has(eventName)) return;

    const listener = JitsiExternalApiConferences[mainConferenceIndex]?.listeners
        ?.set?.(eventName, (...args: any) => dispatch(conferenceSlice.actions.on({eventName, args})))
        ?.get?.(eventName);
    api.addEventListener(eventName, listener)
}

export const selectConference = (state: RootState) => state.conference;

export default conferenceSlice.reducer;
