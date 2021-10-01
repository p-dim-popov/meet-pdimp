import React, {FormEvent, useCallback, useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {FilledInput, FormControl, InputLabel, Button, Typography} from "@mui/material";
import {generateSlug} from "random-word-slugs";
import {CenteredBox} from "../../components";
import {ReactComponent as HomeLogo} from '../../resources/blogging.svg';
import styled from "@emotion/styled";

const StyledHomeLogo = styled(HomeLogo)`
    max-height: 50vh;
`;

const StyledButton = styled(Button)`
    margin: 10px;
`;

export const Home: React.FC = () => {
    const history = useHistory();
    const [roomName, _setRoomName] = useState<string>('');
    const setRoomName = (value: string) => _setRoomName(value.replaceAll(' ', '_'))

    const [generatedRoomName, setGeneratedRoomName] = useState<string>(generateSlug());
    useEffect(() => {
        const timeouts = new Set<number>();

        const roomNameDrawer = () => {
            setPlaceholder('');
            const slug = generateSlug();
            setGeneratedRoomName(slug);
            for (let i = 0; i < slug.length; i++) {
                const timeout = setTimeout(() => {
                    setPlaceholder((prevState) => prevState + slug[i]);
                    timeouts.delete(timeout);
                }, (i + 1) * 100) as unknown as number;
                timeouts.add(timeout);
            }

            return roomNameDrawer;
        };

        const intervalRef = setInterval(roomNameDrawer(), 5_000);
        return () => {
            clearInterval(intervalRef);
            timeouts.forEach((t) => clearTimeout(t));
        };
    }, []);

    const [placeholder, setPlaceholder] = useState<string>(generatedRoomName);

    const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        event?.preventDefault?.();
        const _roomName = (roomName || generatedRoomName).replaceAll(' ', '_');
        history.push(`/${_roomName}`)
    }, [generatedRoomName, history, roomName]);

    return (
        <>
            <form onSubmit={onSubmit}>
                <CenteredBox>
                    <Typography variant="h2" gutterBottom component="div" textAlign="center" >
                        Peter Popov's Conference App
                    </Typography>
                    <StyledHomeLogo />
                    <FormControl focused margin="dense">
                        <InputLabel>Conference Name</InputLabel>
                        <FilledInput
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder={placeholder}
                        />
                    </FormControl>
                    <StyledButton variant="contained" type="submit">Start meeting</StyledButton>
                </CenteredBox>
            </form>
        </>
    )
};