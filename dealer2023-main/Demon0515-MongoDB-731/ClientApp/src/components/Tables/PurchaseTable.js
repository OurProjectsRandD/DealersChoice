import React, { useCallback, useState } from "react";
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
import PurchasingTokensModal from "../../components/Dialogs/PurchasingTokensModal";
import { useDispatch } from "react-redux";
import { buyTokens } from "../../slice/authSlice";

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

const PurchaseTable = () => {
  const [purchasingTokensModalOpen, setPurchasingTokensModalOpen] =
    useState(false);

  const dispatch = useDispatch();

  const purchaseTokenFeedback = useCallback(async (result, tokenValue) => {
    if (result.data === true) {
      alert("Successfully Purchased!");
      dispatch(buyTokens(tokenValue));
    }
  }, []);

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table id="shopTable" aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Item</StyledTableCell>
                  <StyledTableCell>Description</StyledTableCell>
                  <StyledTableCell>Price</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <StyledTableRow>
                  <StyledTableCell component="th" scope="row">
                    <b>Tokens</b>
                  </StyledTableCell>
                  <StyledTableCell>
                    Purchase tokens in any amount
                  </StyledTableCell>
                  <StyledTableCell>
                    <Button
                      sx={{ mt: 1, mb: 1 }}
                      onClick={() => setPurchasingTokensModalOpen(true)}
                    >
                      Drop down with bulk pricing models
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell component="th" scope="row">
                    <b>Personal Poker Party</b>
                  </StyledTableCell>
                  <StyledTableCell>
                    Just upload an image for the cards back design and select
                    the colors for your game theme.
                  </StyledTableCell>
                  <StyledTableCell>
                    <Button
                      sx={{ mt: 1, mb: 1 }}
                      onClick={() => setPurchasingTokensModalOpen(true)}
                    >
                      Buy now (500 tokens)
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell component="th" scope="row">
                    <b>Gift Cards</b>
                  </StyledTableCell>
                  <StyledTableCell>
                    Enough tokens for 4 games with video each month*
                  </StyledTableCell>
                  <StyledTableCell>
                    <Button
                      sx={{ mt: 1, mb: 1 }}
                      onClick={() => setPurchasingTokensModalOpen(true)}
                    >
                      Buy Now for $14.95 per month
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <PurchasingTokensModal
        open={purchasingTokensModalOpen}
        setOpen={setPurchasingTokensModalOpen}
        purchaseFeedBack={purchaseTokenFeedback}
      />
    </>
  );
};

export default PurchaseTable;
