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
import SettlementModalEndGame from "../Dialogs/SettlementModalEndGame";

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

const GamesTable = ({ games }) => {
  return (
    <>
      <Grid container>
        <Grid item xs={12} marginTop={2}>
          <TableContainer component={Paper}>
            <Table id="registeredUsersTable" aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Game Code</StyledTableCell>
                  <StyledTableCell>Host</StyledTableCell>
                  <StyledTableCell>Started</StyledTableCell>
                  <StyledTableCell>Duration</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {games.map((game, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{game.GameCode}</StyledTableCell>
                    <StyledTableCell>{game.HostName}</StyledTableCell>
                    <StyledTableCell>{game.CreatedOn}</StyledTableCell>
                    <StyledTableCell>
                      {game.DurationSeconds === -1 ? (
                        "Playing"
                      ) : (
                        <>
                          {parseInt(game.DurationSeconds / 3600)} :{" "}
                          {parseInt((game.DurationSeconds % 3600) / 60)} :{" "}
                          {parseInt(game.DurationSeconds % 60)}
                        </>
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
};

export default GamesTable;
