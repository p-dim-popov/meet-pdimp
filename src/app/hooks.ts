import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import {listenFor} from "./conferenceSlice";
import {useEffect} from "react";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useListenForJitsiExternalApiEvent = (eventName: string, memoizedCallback: Function) => {
    useAppDispatch()(listenFor(eventName));
    const events = useAppSelector((state) => state.conference.capturedEvents[eventName]) || [];
    const lastEventArgs = events[events.length - 1];
    useEffect(() => {
        if ((lastEventArgs ?? null) === null) return;
        memoizedCallback(...lastEventArgs);
    }, [events.length, memoizedCallback, lastEventArgs])
}
