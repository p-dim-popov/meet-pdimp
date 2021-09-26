import React, {useState} from "react";
import {Dialog, DialogContent, DialogTitle, FilledInput, Popover} from "@mui/material";
import {copyPlaintext} from "../utils/strings";
import styled from "@emotion/styled";

interface IProps {
    isOpen: boolean;
    setIsInviteDialogOpen: (state: boolean) => void;
}

const StyledPopover = styled(Popover)`
  > .MuiPopover-paper {
    padding: 7px;
    background-color: #0376da;
    color: white;
  }
`;

const StyledInviteCodeBox = styled(FilledInput)`
  > .MuiFilledInput-input {
    cursor: pointer;
  }
`;

export const InviteDialog: React.FC<IProps> = (props) => {
    const [copyAnchorEl, setCopyCopyAnchorEl] = useState<HTMLInputElement|null>(null);
    const openedCopySuccess = Boolean(copyAnchorEl);
    copyAnchorEl?.select?.();

    const inviteLink = window.location.toString();

    return (
        <Dialog
            open={props.isOpen}
            onClose={() => props.setIsInviteDialogOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle>Invite people to join</DialogTitle>
            <DialogContent>
                <StyledPopover
                    open={openedCopySuccess}
                    onClose={() => setCopyCopyAnchorEl(null)}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    anchorEl={copyAnchorEl}
                >
                    Copied!
                </StyledPopover>
                <StyledInviteCodeBox
                    readOnly
                    value={inviteLink}
                    hiddenLabel
                    fullWidth
                    componentsProps={{
                        input: {
                            onClick: async (event) => {
                                const target = event.target as HTMLInputElement;
                                const isSuccess = await copyPlaintext(inviteLink);
                                if (isSuccess) {
                                    setCopyCopyAnchorEl(target);
                                }
                            }
                        }
                    }}
                />
            </DialogContent>
        </Dialog>
    )
};
