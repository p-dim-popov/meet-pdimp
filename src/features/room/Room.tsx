import React, {useEffect} from "react";
import {JitsiManager} from "../../utils/JitsiManager";
import {useHistory, useParams} from "react-router-dom";

export interface IRouteParams {
    roomName: string;
}

export const Room: React.FC = () => {
    const { roomName } = useParams<IRouteParams>();
    const history = useHistory();

    useEffect(() => {
        console.log('[Room]: Mounting/Changing room!', roomName)
        if (!roomName) return;

        const domain = 'beta.meet.jit.si';
        const _roomName = `pdimp_${encodeURIComponent(roomName)}`;
        const options = {
            roomName: _roomName,
            width: '100%',
            height: '100%',
            parentNode: document.querySelector('#meet')
        };
        console.log('[Room]: Room name ->', _roomName);
        const api = new JitsiManager.ExternalApiClass(domain, options);
        const goToHome = () => {
            console.log('[Room]: Redirecting to home')
            history.push('/');
        }
        api.addEventListener('readyToClose', goToHome);
        return () => {
            console.log('[Room]: Unmounting/Room changing!')
            api?.dispose?.();
            api?.removeEventListener?.('readyToClose', goToHome);
        }
    }, [roomName])
    return roomName
        ? <div style={{ width: '99.4vw', height: '99.5vh' }} id="meet"/>
        : null;
};