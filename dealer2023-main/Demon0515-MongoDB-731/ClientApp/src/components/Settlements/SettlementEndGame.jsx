import { memo, useCallback, useMemo } from "react";
import {
  TableCell,
  TableRow,
  styled,
  tableCellClasses,
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
} from "@mui/material";
import { CalculateTransanction } from "../../common/game/GameControl";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: 10,
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

function SettleGame(
  props = {
    setOpen: false,
    gameState: {},
    isShow: true,
  }
) {
  const ArrTransaction = useMemo(
    () => CalculateTransanction(props.gameState),
    [props.gameState]
  );

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <TableContainer component={Paper}>
        <Table aria-label="settled End Game table">
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
    </Box>
  );
}

const SettlementEndGame = memo(SettleGame);
export { SettlementEndGame };
