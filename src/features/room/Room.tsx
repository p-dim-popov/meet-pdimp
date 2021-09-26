import React, {useCallback, useEffect, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import {InviteDialog} from "../../components";
import {CircularProgress, Dialog, DialogContent} from "@mui/material";
import {useAppDispatch, useAppSelector, useListenForJitsiExternalApiEvent} from "../../app/hooks";
import {conferenceSlice, ConferenceStatus, createConferenceAsync, selectConference} from "../../app/conferenceSlice";

export interface IRouteParams {
    roomName: string;
}

export const Room: React.FC = () => {
    const conference = useAppSelector(selectConference);
    const params = useParams<IRouteParams>();
    const history = useHistory();
    const dispatch = useAppDispatch();
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

    useListenForJitsiExternalApiEvent('readyToClose', useCallback(() => {
        console.log('[pdimp]: Redirecting to home');
        dispatch(conferenceSlice.actions.exit());
        history.push('/');
    }, [dispatch, history]));

    useListenForJitsiExternalApiEvent('toolbarButtonClicked', useCallback(({ key }: { key: string }) => {
        switch (key) {
            case 'invite':
                setIsInviteDialogOpen(true);
                break;
            case 'participants-pane':
                alert('opened participants-pane')
        }
    }, []));

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
            <InviteDialog isOpen={isInviteDialogOpen} setIsInviteDialogOpen={setIsInviteDialogOpen} />
            <Dialog open={conference.status !== ConferenceStatus.Idle}>
                <DialogContent>
                    <CircularProgress />
                </DialogContent>
            </Dialog>
        </>
    );
};