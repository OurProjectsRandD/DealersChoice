import React, { useMemo } from "react";
import { Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import MembershipPlanTable from "../components/Tables/MembershipPlanTable";

const MembershipPlan = ({ isAuthorized }) => {
  const navigator = useNavigate();
  const asset = useMemo(() => {
    if (!isAuthorized) return {};
    return JSON.parse(localStorage.getItem("asset"));
  }, [isAuthorized]);

  return (
    <>
      <Grid container>
        <Grid item xs={2} marginTop={1}>
          <Typography component="h1" variant="h5">
            Tokens: {asset.Tokens}
          </Typography>
        </Grid>
        <Grid item xs={2} marginTop={1}>
          <Button
            variant="contained"
            onClick={() => navigator("/token-purchase")}
          >
            Purchase more tokens
          </Button>
        </Grid>
      </Grid>
      <MembershipPlanTable />
    </>
  );
};

export default MembershipPlan;
