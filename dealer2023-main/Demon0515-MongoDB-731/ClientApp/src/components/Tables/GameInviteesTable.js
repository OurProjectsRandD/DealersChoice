import React, { useCallback, useEffect, useState } from "react";
import { SendRequest } from "../../util/AxiosUtil";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import { DialogContent } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useSelector } from "react-redux";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const GameInviteesTable = () => {
  const [invitees, setInvitees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [invitee_email, setInviteeEmail] = useState("");
  const gameState = useSelector((state) => state.gameState);

  const handleInvite = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleRemove = useCallback(
    (email, index) => {
      SendRequest({
        url: "Game/_RemoveInvite",
        method: "POST",
        data: {
          InviteeEmail: email,
          GameCode: gameState.GameCode,
        },
      }).then((result) => {
        if (result.data === true) {
          setInvitees(invitees.filter((inv, i) => i !== index));
        }
      });
    },
    [invitees, gameState]
  );

  const handleOk = useCallback(() => {
    if (invitee_email.trim(" ").length === 0) {
      alert("Input Email");
      return;
    }
    SendRequest({
      url: "Game/Invite",
      method: "POST",
      data: {
        InviteeEmail: invitee_email,
        GameCode: gameState.GameCode,
      },
    }).then((result) => {
      if (result.data === true) {
        setInvitees([
          ...invitees,
          {
            InviteeEmail: invitee_email,
          },
        ]);
      }
    });
    setModalOpen(false);
  }, [invitees, invitee_email, gameState]);

  useEffect(() => {
    SendRequest({
      url: "Game/GetInvitees",
      method: "POST",
      data: {
        GameCode: gameState.GameCode,
      },
    }).then((result) => {
      setInvitees(result.data);
      setModalOpen(false);
    });
  }, [gameState]);

  return (
    <>
      <Button variant="contained" onClick={handleInvite}>
        Invite
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Email</StyledTableCell>
              {/* <StyledTableCell>Action</StyledTableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {invitees.map((invitee, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell>{invitee.InviteeEmail}</StyledTableCell>
                {/* <StyledTableCell>
                  <Button
                    variant="contained"
                    onClick={() => handleRemove(invitee.InviteeEmail, index)}
                  >
                    Remove
                  </Button>
                </StyledTableCell> */}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={modalOpen}
        keepMounted
        onClose={() => setModalOpen(false)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Input Invitee Email"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={(ev) => setInviteeEmail(ev.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleOk}>Ok</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GameInviteesTable;
