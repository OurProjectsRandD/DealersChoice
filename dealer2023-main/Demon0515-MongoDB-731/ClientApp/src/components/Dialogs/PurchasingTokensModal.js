import React, { useCallback, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { SendRequest } from "../../util/AxiosUtil";
import { TextField } from "@mui/material";

const PurchasingTokensModal = ({ open, setOpen, purchaseFeedBack }) => {
  const [tokenValue, setTokenValue] = useState(0);
  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleOK = useCallback(() => {
    //Paypal Integration Code here
    SendRequest({
      url: "MembershipManage/_PurchaseTokens",
      data: {
        Tokens: tokenValue,
      },
    }).then((result) => purchaseFeedBack(result, tokenValue));
    setOpen(false);
  }, [purchaseFeedBack, setOpen, tokenValue]);

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>
        Purchase New Tokens with{" "}
        {tokenValue.length === 0
          ? 0
          : parseFloat(
              parseFloat(tokenValue) / process.env.REACT_APP_TOKEN_PER_CASH
            ).toFixed(2)}
        $
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          required
          fullWidth
          id="tokens"
          defaultValue={0}
          InputProps={{
            inputProps: {
              step: 100,
            },
          }}
          label="Tokens"
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

export default PurchasingTokensModal;
