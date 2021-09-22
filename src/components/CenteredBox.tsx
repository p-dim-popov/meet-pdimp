import React from "react";
import {Box} from "@mui/material";

export const CenteredBox: React.FC = (props) => {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            flexDirection="column"
            {...props}
        />
    )
}