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

const SalesTrackingTable = ({ handleClick = () => {} }) => {
  const [transactions, setTransactions] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [selected, setSelected] = useState({ row: -1, col: -1 });
  useEffect(() => {
    const fetch = async () => {
      SendRequest({
        url: "Admin/get-transaction-count",
        method: "post",
      })
        .then((res) => {
          setTransactions(res.data);
        })
        .catch(() => {
          alert("failed");
        });
    };
    fetch();
  }, []);
  useEffect(() => {
    SendRequest({
      url: "Admin/get-avenue",
      method: "post",
    })
      .then((res) => {
        setRevenue(res.data);
      })
      .catch(() => {
        alert("failed");
      });
  });
  return (
    <>
      <Grid container>
        <Grid item xs={12} marginTop={2}>
          <Typography component="h1" variant="h5">
            Game Monitoring
          </Typography>
          <TableContainer component={Paper}>
            <Table id="membershipTable" aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell>24 hours</StyledTableCell>
                  <StyledTableCell>This week</StyledTableCell>
                  <StyledTableCell>This month</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <StyledTableRow>
                  <StyledTableCell component="th" scope="row">
                    <b>Transactions</b>
                  </StyledTableCell>
                  {transactions.map((transaction, index) => (
                    <StyledTableCell
                      onClick={() => {
                        handleClick(0, index);
                        setSelected({ row: 0, col: index });
                      }}
                      className={
                        selected.row === 0 && selected.col === index
                          ? "table-cell-selected"
                          : ""
                      }
                    >
                      {transaction}
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell component="th" scope="row">
                    <b>Revenue</b>
                  </StyledTableCell>
                  {revenue.map((re, index) => (
                    <StyledTableCell
                      onClick={() => {
                        handleClick(0, index);
                        setSelected({ row: 1, col: index });
                      }}
                      className={
                        selected.row === 1 && selected.col === index
                          ? "table-cell-selected"
                          : ""
                      }
                    >
                      {re}
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
};

export default SalesTrackingTable;
