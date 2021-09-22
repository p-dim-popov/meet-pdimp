import React, {useEffect, useState} from "react";
import {JitsiManager} from "../../utils/JitsiManager";
import {useHistory, useParams} from "react-router-dom";
import {InviteDialog} from "../../components";

export interface IRouteParams {
    roomName: string;
}

const useJitsiExternalApi = (roomName: string, handlers: { [key: string]: Function } = {}) => {
    const history = useHistory();

    useEffect(() => {
        console.log('[Room]: Mounting/Changing room!', roomName)
        if (!roomName) return;

        const _roomName = `pdimp_${encodeURIComponent(roomName)}_pdimp`;
        console.log('[Room]: Room name ->', _roomName);
        const api = new JitsiManager.ExternalApiClass(JitsiManager.DOMAIN, JitsiManager.getExternalApiOptions(_roomName));
        Object.entries(handlers).forEach(([key, value]) => api.addEventListener(key, value))
        return () => {
            console.log('[Room]: Unmounting/Room changing!')
            api?.dispose?.();
            Object.entries(handlers).forEach(([key, value]) => api.removeEventListener(key, value))
        }
    }, [handlers, history, roomName])
}

export const Room: React.FC = () => {
    const { roomName } = useParams<IRouteParams>();
    const history = useHistory();
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [handlers] = useState({
        readyToClose: () => {
            console.log('[Room]: Redirecting to home')
            history.push('/');
        },
        toolbarButtonClicked: ({ key }: { key: string }) => {
            switch (key) {
                case 'invite':
                    setIsInviteDialogOpen(true);
                    break;
            }
        },
    });

    useJitsiExternalApi(roomName, handlers);

    if (!roomName) {
        return <>Not in a room</>;
    }
    return (
        <>
            <InviteDialog isOpen={isInviteDialogOpen} setIsInviteDialogOpen={setIsInviteDialogOpen} />
            <div
                style={{width: '100vw', height: '100vh', maxWidth: '100%', overflow: "hidden"}}
                id="meet"
            />
        </>
    );
};