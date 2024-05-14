import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { CalculateTransanction } from "../../common/game/GameControl";

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

const SettlementModalEndGame = (
  props = {
    open: false,
    setOpen: false,
    gameState: {},
    isShow: true,
  }
) => {
  const navigator = useNavigate();
  const handleClose = useCallback(() => {
    props.setOpen(false);
    if (!props.isShow) navigator("/");
  }, [props]);

  const ArrTransaction = useMemo(
    () => CalculateTransanction(props.gameState),
    [props.gameState]
  );

  return (
    <Dialog
      open={props.open}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogContent>
        <TableContainer component={Paper}>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Amount</StyledTableCell>
                <StyledTableCell align="right">Transaction</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...props.gameState.ActivePlayers]
                .sort(
                  (a, b) =>
                    a.PlayerNetStatusFinal +
                    a.PlayerAmount -
                    (b.PlayerNetStatusFinal + b.PlayerAmount)
                )
                .map((obj, index) => {
                  let tmpTransactionMessage = [];
                  ArrTransaction.filter(
                    (x) => x.from.PlayerId === obj.PlayerId
                  ).forEach((obj2) => {
                    tmpTransactionMessage.push(
                      obj.PlayerName +
                        " owes " +
                        obj2.amount +
                        " to " +
                        obj2.to.PlayerName +
                        ""
                    );
                  });
                  return (
                    <StyledTableRow key={index}>
                      <StyledTableCell>{obj.PlayerName}</StyledTableCell>
                      <StyledTableCell>
                        {obj.PlayerNetStatusFinal + obj.PlayerAmount}
                      </StyledTableCell>
                      <StyledTableCell>
                        {tmpTransactionMessage.map((str) => (
                          <div>{str}</div>
                        ))}
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SettlementModalEndGame);
