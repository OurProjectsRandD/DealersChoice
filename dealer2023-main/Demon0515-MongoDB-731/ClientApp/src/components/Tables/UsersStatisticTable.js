import React from "react";
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

const UsersStatisticTable = () => {
  return (
    <>
      <Grid container>
        <Grid item xs={12} marginTop={2}>
          <Typography component="h1" variant="h5">
            User Management
          </Typography>
          <TableContainer component={Paper}>
            <Table id="membershipTable" aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>24 hours</StyledTableCell>
                  <StyledTableCell>This week</StyledTableCell>
                  <StyledTableCell>This month</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody></TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
};

export default UsersStatisticTable;
