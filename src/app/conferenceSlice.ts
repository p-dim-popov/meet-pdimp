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

export enum ParticipantsDisplayType {
    Tiled = 'tiled',
    NonTiled = 'non-tiled',
    Pinned = 'pinned',
}

export interface ParticipantsDisplay {
    type: ParticipantsDisplayType;
    value?: string;
}

export interface ConferenceState {
    status: ConferenceStatus;
    capturedEvents: { [key: string]: any[] };
    mainConferenceKey: string|null;
    participantsDisplay: ParticipantsDisplay;
}

const initialState: ConferenceState = {
    status: ConferenceStatus.None,
    capturedEvents: {},
    mainConferenceKey: null,
    participantsDisplay: {
        type: ParticipantsDisplayType.NonTiled,
    }
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
        const conferenceIndex = thunkAPI.getState().conference.mainConferenceKey;
        if (conferenceIndex) {
            await JitsiExternalApiConferences[conferenceIndex]?.get?.();
        }
    }
);

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
            if (state.mainConferenceKey === null) return;

            JitsiExternalApiConferences[state.mainConferenceKey].dispose();
            delete JitsiExternalApiConferences[state.mainConferenceKey];
            state.status = ConferenceStatus.None;
            state.capturedEvents = {};
            state.mainConferenceKey = null;
        },
        setDisplay: (state, action: PayloadAction<ParticipantsDisplay>) => {
            if (state.participantsDisplay.type === ParticipantsDisplayType.Pinned && action.payload.type === ParticipantsDisplayType.NonTiled) {
                state.participantsDisplay.type = ParticipantsDisplayType.NonTiled;
            } else {
                state.participantsDisplay = action.payload;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createConferenceAsync.pending, (state, action) => {
                // Check this if we want only one conference to exist;
                if (state.mainConferenceKey !== null) return;

                const jeac = new JitsiExternalApiConference();
                state.mainConferenceKey = jeac.id;
                jeac.setPromise(new Promise((resolve) => {
                    const options = JitsiManager.getExternalApiOptions(action.meta.arg.roomName, jeac.id, resolve);
                    jeac.setInstance(new JitsiManager.ExternalApiClass(JitsiManager.DOMAIN, options));
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
    const {conference: {mainConferenceKey}} = getState();
    if (mainConferenceKey === null) return;

    if (!JitsiExternalApiConferences[mainConferenceKey]) return;

    const api = await JitsiExternalApiConferences[mainConferenceKey].get();

    if (JitsiExternalApiConferences[mainConferenceKey].listeners.has(eventName)) return;

    const listener = JitsiExternalApiConferences[mainConferenceKey]?.listeners
        .set(eventName, (...args: any) => dispatch(conferenceSlice.actions.on({eventName, args})))
        .get(eventName);
    api.addEventListener(eventName, listener)
}

export const selectConference = (state: RootState) => state.conference;

export const selectIsParticipantPinned = (id: string) => (state: RootState) => state.conference.participantsDisplay.value === id;

export const selectEventListByName = (eventName: string) => (state: RootState) => state.conference.capturedEvents[eventName] || [];

export const selectLastEventOfType = (eventName: string) => (state: RootState) => {
    const eventList = selectEventListByName(eventName)(state);
    return !!eventList.length ? eventList[eventList.length - 1] :  null;
}

export default conferenceSlice.reducer;
