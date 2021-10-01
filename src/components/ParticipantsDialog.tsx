import React, {useCallback} from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    List,
} from "@mui/material";
import {JitsiExternalApiConferences} from "../features/JitsiExternalApiConference";
import {useForceUpdate, useListenForJitsiExternalApiEvent} from "../app/hooks";
import {ParticipantListItem} from "./ParticipantListItem";
import { JitsiExternalApiContext } from "../contexts";

export interface IProps {
    open: boolean;
    toggle: (open: boolean) => void;
    conferenceKey: string;
}

export const ParticipantsDialog: React.FC<IProps> = (props) => {
    const api = JitsiExternalApiConferences[props.conferenceKey].get() as any;
    const participants = api?.getParticipantsInfo?.();
    const forceUpdate = useForceUpdate();

    const participantsChanged = useCallback(() => {
        forceUpdate();
    }, []);

    useListenForJitsiExternalApiEvent('participantLeft', participantsChanged);
    useListenForJitsiExternalApiEvent('participantKickedOut', participantsChanged);
    useListenForJitsiExternalApiEvent('participantJoined', participantsChanged);

    return (
        <JitsiExternalApiContext.Provider value={api} >
            <Dialog
                open={props.open}
                onClose={() => props.toggle(false)}
            >
                <DialogTitle>Participants</DialogTitle>
                <DialogContent>
                    <List>
                        {participants?.map?.((_: any) => (<ParticipantListItem {..._} />))}
                    </List>
                </DialogContent>
            </Dialog>
        </JitsiExternalApiContext.Provider>
    );
}