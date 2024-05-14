import React, { useCallback, useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { SendRequest } from "../../util/AxiosUtil";
import SettlementModalEndGame from "../../components/Dialogs/SettlementModalEndGame";
import { GenerateCode } from "../../common/game/basic";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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

const Games = ({ isAuthorized }) => {
  const navigator = useNavigate();
  const [pastGames, setPastGames] = useState([]);
  const [recurringGame, setRecurringGames] = useState([]);

  const [settlementModalEndGameOpen, setSettlementModalEndGameOpen] =
    useState(false);

  const [modalGameState, setModalGameState] = useState({
    ActivePlayers: [],
  });

  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchPastGames = () => {
      SendRequest({
        url: "Game/GetPastGames",
        method: "POST",
      }).then((result) => {
        setPastGames(result.data);
      });
    };
    fetchPastGames();
  }, []);

  useEffect(() => {
    const fetchRecurringGames = () => {
      SendRequest({
        url: "Game/GetRecurringGames",
        method: "POST",
      }).then((result) => {
        setRecurringGames(result.data);
      });
    };
    fetchRecurringGames();
  }, []);

  const StartRecurringGame = useCallback(
    (Name) => {
      let GameCode = GenerateCode();

      SendRequest({
        method: "post",
        url: "Game/CreateGame",
        data: {
          HostName: Name,
          MeetingId: null,
          UserId: auth.user.UserId,
          DisplayName: auth.user.DisplayName,
          GameCode,
        },
      }).then((result) => {
        if (result.data) {
          alert("Game Created Successfully.");
          navigator("/game/main-game?GameCode=" + GameCode);
        }
      });
    },
    [auth]
  );

  const ShowResult = useCallback((pastGame) => {
    setModalGameState(pastGame);
    setSettlementModalEndGameOpen(true);
  }, []);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={7}>
          <Typography component="h1" variant="h5">
            Recurring games
          </Typography>
          <TableContainer component={Paper}>
            <Table id="RecurringTable" aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell align="right">Start</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recurringGame.map((row) => (
                  <StyledTableRow key={row.Name}>
                    <StyledTableCell component="th" scope="row">
                      {row.Name}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Button
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => StartRecurringGame(row.Name)}
                      >
                        Start
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={5}>
          <Typography component="h1" variant="h5">
            Past Games
          </Typography>
          <TableContainer component={Paper}>
            <Table id="pastTable" aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Host Name</StyledTableCell>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell align="right">Result</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pastGames.map((pastGame, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell scope="row">
                      {pastGame.HostName}
                    </StyledTableCell>
                    <StyledTableCell>{pastGame.CreatedDate}</StyledTableCell>
                    <StyledTableCell align="right">
                      <Button
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => ShowResult(pastGame)}
                      >
                        Result
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <SettlementModalEndGame
        isShow={true}
        gameState={modalGameState}
        open={settlementModalEndGameOpen}
        setOpen={setSettlementModalEndGameOpen}
      />
    </>
  );
};

export default Games;
