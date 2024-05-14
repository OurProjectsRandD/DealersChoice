import React, { useCallback, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { SendRequest } from "../../util/AxiosUtil";
import { TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { buyVideoTime } from "../../slice/authSlice";

const PurchasingVideoMinutesModal = ({ open, setOpen }) => {
  const [tokenValue, setTokenValue] = useState(0);
  const asset = useSelector((state) => state.auth.asset);
  const dispatch = useDispatch();

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleOK = useCallback(() => {
    if (
      tokenValue >
      asset.Tokens * process.env.REACT_APP_VIDEOMINUTES_PER_TOKEN
    ) {
      alert("Not sufficient tokens");
      return;
    }
    //Paypal Integration Code here
    SendRequest({
      url: "MembershipManage/_PurchaseVideoTime",
      data: {
        VideoMinutes: tokenValue,
      },
    }).then((result) => {
      if (result.data) {
        //increase asset's video time
        dispatch(buyVideoTime(tokenValue));
        setOpen(false);
      } else alert("Purchasing failed.");
    });
  }, [asset.Tokens, dispatch, setOpen, tokenValue]);

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>
        Purchase Video Minutes with{" "}
        {parseInt(tokenValue / process.env.REACT_APP_VIDEOMINUTES_PER_TOKEN)}{" "}
        Tokens
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          required
          fullWidth
          id="minutes"
          defaultValue={0}
          InputProps={{
            inputProps: {
              step: 10,
              min: 0,
              max: asset.Tokens * process.env.REACT_APP_VIDEOMINUTES_PER_TOKEN,
            },
          }}
          label="Video Minutes"
          type="number"
          onChange={(ev) => setTokenValue(ev.target.value)}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOK}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchasingVideoMinutesModal;
