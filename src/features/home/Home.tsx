import React, {useRef} from "react";
import {useHistory} from "react-router-dom";

export const Home: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const history = useHistory();

    return (
        <form
            onSubmit={(event) => {
                event?.preventDefault?.();
                const value = inputRef?.current?.value;
                if (!value) return;
                history.push(`/${value}`)
            }}
            style={{ textAlign: 'center' }}
        >
            <input ref={inputRef} placeholder="Enter room name" type="text" required />
            <button>Start meeting</button>
        </form>
    )
};