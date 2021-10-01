import React, {useCallback, useEffect, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import {InviteDialog, ParticipantsDialog} from "../../components";
import {CircularProgress, Dialog, DialogContent} from "@mui/material";
import {useAppDispatch, useAppSelector, useListenForJitsiExternalApiEvent} from "../../app/hooks";
import {
    conferenceSlice,
    ConferenceStatus,
    createConferenceAsync,
    ParticipantsDisplayType,
    selectConference
} from "../../app/conferenceSlice";
import {Helmet} from 'react-helmet';
import {JitsiExternalApiConferences} from "../JitsiExternalApiConference";

export interface IRouteParams {
    roomName: string;
}

export const Room: React.FC = () => {
    const conference = useAppSelector(selectConference);
    const params = useParams<IRouteParams>();
    const history = useHistory();
    const dispatch = useAppDispatch();
    const [isInviteDialogOpen, toggleInviteDialog] = useState(false);
    const [isParticipantsDialogOpen, toggleParticipantsDialog] = useState(false);

    useListenForJitsiExternalApiEvent('readyToClose', useCallback(() => {
        console.log('[pdimp]: Redirecting to home');
        dispatch(conferenceSlice.actions.exit());
        history.push('/');
    }, [dispatch, history]));

    useListenForJitsiExternalApiEvent('toolbarButtonClicked', useCallback(({ key }: { key: string }) => {
        switch (key) {
            case 'invite':
                toggleInviteDialog(true);
                break;
            case 'participants-pane':
                toggleParticipantsDialog(true);
        }
    }, []));

    useListenForJitsiExternalApiEvent('tileViewChanged', useCallback(({ enabled }: { enabled: boolean }) => {
        dispatch(conferenceSlice.actions.setDisplay({ type: enabled ? ParticipantsDisplayType.Tiled : ParticipantsDisplayType.NonTiled }))
    }, [dispatch]))

    useEffect(() => {
        switch (conference.status) {
            case ConferenceStatus.None:
                dispatch(createConferenceAsync({ roomName: params.roomName }));
                break;
            case ConferenceStatus.Loading:
            case ConferenceStatus.Idle:
                break;
        }
    }, [conference.status, dispatch, params.roomName])

    return (
        <>
            <Helmet>
                <title>{`${params.roomName} | ${process.env.REACT_APP_DOCUMENT_TITLE_BASE}`}</title>
            </Helmet>
            <InviteDialog open={isInviteDialogOpen} toggle={toggleInviteDialog} />
            {(conference.mainConferenceKey !== null) && (conference.status === ConferenceStatus.Idle) && (JitsiExternalApiConferences[conference.mainConferenceKey].loaded) && (
                <ParticipantsDialog open={isParticipantsDialogOpen} toggle={toggleParticipantsDialog} conferenceKey={conference.mainConferenceKey} />
            )}
            <Dialog open={conference.status !== ConferenceStatus.Idle}>
                <DialogContent>
                    <CircularProgress />
                </DialogContent>
            </Dialog>
        </>
    );
};