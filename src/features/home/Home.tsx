import React, {FormEvent, useCallback, useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {FilledInput, FormControl, InputLabel, Button} from "@mui/material";
import {generateSlug} from "random-word-slugs";
import {CenteredBox} from "../../components";

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
        const _roomName = roomName || generatedRoomName;
        history.push(`/${_roomName}`)
    }, [generatedRoomName, history, roomName]);

    return (
        <form onSubmit={onSubmit}>
            <CenteredBox>
                    <FormControl focused>
                        <InputLabel htmlFor="component-outlined">Name</InputLabel>
                        <FilledInput
                            id="component-filled"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder={placeholder}
                        />
                    </FormControl>
                    <Button variant="contained" type="submit" >Start meeting</Button>
            </CenteredBox>
        </form>
    )
};