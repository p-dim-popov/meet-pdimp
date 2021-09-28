import React, {useCallback, useContext, useState} from "react";
import {Avatar, Collapse, List, ListItem, ListItemAvatar, ListItemButton, ListItemText} from "@mui/material";
import styled from "@emotion/styled";
import {JitsiExternalApiContext} from "../contexts";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {conferenceSlice, ParticipantsDisplayType, selectIsParticipantPinned} from "../app/conferenceSlice";

export interface IProps {
    participantId: string;
    email: string;
    formattedDisplayName: string;
    avatarURL: string;
}

const ExpandMore = styled.span`
  &:after {
    content: "^";
    color: white;
    font-weight: bold;
  }
  cursor: pointer;
  align-self: baseline;
  padding: 1px 4px;
  margin: 5px;
  border: #bdbdbd solid;
  border-radius: 50%;
  background-color: #bdbdbd;
`;

const ExpandLess = styled.span`
  &:after {
    content: "^";
    color: white;
    font-weight: bold;
  }
  cursor: pointer;
  align-self: baseline;
  transform: rotate(180deg);
  padding: 1px 4px;
  margin: 5px;
  border: #bdbdbd solid;
  border-radius: 50%;
  background-color: #bdbdbd;
`;

export const ParticipantListItem: React.FC<IProps> = (props) => {
    const api = useContext(JitsiExternalApiContext);
    const dispatch = useAppDispatch();
    const [open, setOpenSubmenu] = useState(false);
    const pinned = useAppSelector(selectIsParticipantPinned(props.participantId));

    const togglePin = useCallback(() => {
        if (pinned) {
            api.executeCommand('setTileView', true);
        } else {
            dispatch(conferenceSlice.actions.setDisplay({ type: ParticipantsDisplayType.Pinned, value: props.participantId }))
            api.pinParticipant(props.participantId);
        }
    }, [api, dispatch, pinned, props.participantId]);

    console.log('[pdimp/ParticipantListItem]', props);

    const toggleSubMenu = useCallback(() => {
        setOpenSubmenu((oldState) => !oldState);
    }, [])

    return (
        <React.Fragment>
            <ListItem key={props.participantId}>
                <ListItemAvatar>
                    <Avatar src={props.avatarURL}/>
                </ListItemAvatar>
                <ListItemButton onClick={toggleSubMenu}>
                    <ListItemText primary={`Name: ${props.formattedDisplayName}, Email: ${props.email ?? 'N/A'}`}/>
                </ListItemButton>
                {open ? <ExpandLess onClick={toggleSubMenu} /> : <ExpandMore onClick={toggleSubMenu} />}
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItemButton onClick={togglePin}>
                        <ListItemText primary={pinned ? 'Unpin participant' : 'Pin participant'} />
                    </ListItemButton>
                </List>
            </Collapse>
        </React.Fragment>
    );
}