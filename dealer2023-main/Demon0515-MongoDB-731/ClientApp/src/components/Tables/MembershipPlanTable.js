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

const MembershipPlanTable = () => {
  const [memberships, setMemberships] = useState([]);
  const [currentMembership, setCurrentMembership] = useState({
    Id: "",
    Name: "",
  });

  const handleMembershipUpgrade = useCallback((membership, option) => {
    //Paypal Integration Code here
    SendRequest({
      url: "MembershipManage/_UpdateMembership",
      method: "POST",
      data: {
        MembershipPlanId: membership.PlanId,
        BillingPeriod: option,
      },
    }).then((result) => {
      if (result.data === true) {
        alert("Successfully Updated");
        window.location.reload();
        setCurrentMembership(membership);
        //fetchAsset();
      }
    });
    //setOpen(false);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      SendRequest({
        url: "MembershipManage/_GetCurrentMembership",
        method: "POST",
      }).then((res) => {
        setCurrentMembership(res.data);
      });
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      SendRequest({
        url: "MembershipManage/_GetAllMemberShips",
        method: "POST",
      }).then((result) => {
        setMemberships(result.data);
      });
    };
    fetch();
  }, []);

  return (
    <>
      <Grid container>
        <Grid item xs={12} marginTop={2}>
          <Typography component="h1" variant="h5">
            Membership Plans
          </Typography>
          <TableContainer component={Paper}>
            <Table id="membershipTable" aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Plan</StyledTableCell>
                  <StyledTableCell>Description</StyledTableCell>
                  <StyledTableCell>Monthly</StyledTableCell>
                  <StyledTableCell>Annual</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberships.map((membership, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell component="th" scope="row">
                      <b>{membership.Name}</b>
                    </StyledTableCell>
                    <StyledTableCell>{membership.Description}</StyledTableCell>
                    <StyledTableCell>
                      <Button
                        sx={{ mt: 1, mb: 1 }}
                        onClick={() => handleMembershipUpgrade(membership, 0)}
                      >
                        {index === 0
                          ? "Sign Up Now(Free)"
                          : `${membership.Month_Value_In_Cash} `}
                      </Button>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Button
                        sx={{ mt: 1, mb: 1 }}
                        onClick={() => handleMembershipUpgrade(membership, 0)}
                      >
                        {index === 0
                          ? "Sign Up Now(Free)"
                          : ` ${membership.Annual_Value_In_Cash} `}
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <p class="mt-2 ms-2">
            *based on an average 2-hour game of 5 players. Longer games and more
            players add to the cost.
          </p>
        </Grid>
      </Grid>
    </>
  );
};

export default MembershipPlanTable;
