import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import {listenFor, selectConference, selectLastEventOfType} from "./conferenceSlice";
import {useEffect, useState} from "react";
import {JitsiExternalApiConferences} from "../features/JitsiExternalApiConference";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useListenForJitsiExternalApiEvent = (eventName: string, memoizedCallback: Function) => {
    console.log(`[pdimp/useListenForJitsiExternalApiEvent/use]: ${eventName}`)
    const dispatch = useAppDispatch();
    const conference = useAppSelector(selectConference);

    const apiConference = conference.mainConferenceKey !== null ? JitsiExternalApiConferences[conference.mainConferenceKey] : null;
    const apiConferenceListeners = apiConference?.listeners;
    const apiConferenceListenersHasEvent = apiConferenceListeners?.has?.(eventName);
    if (!conference.capturedEvents[eventName] && (!!apiConference && !apiConferenceListenersHasEvent)) {
        console.log(`[pdimp/useListenForJitsiExternalApiEvent/register]: ${eventName}`)
        dispatch(listenFor(eventName));
    }

    const lastEventArgs = useAppSelector(selectLastEventOfType(eventName));
    useEffect(() => {
        if (lastEventArgs === null) return;
        console.log(`[pdimp/useListenForJitsiExternalApiEvent/change]: ${eventName}`, lastEventArgs)
        memoizedCallback(...lastEventArgs);
    }, [memoizedCallback, lastEventArgs, eventName])
}

export const useForceUpdate = () => {
    const [, setValue] = useState(0);
    return () => setValue(value => value + 1);
};