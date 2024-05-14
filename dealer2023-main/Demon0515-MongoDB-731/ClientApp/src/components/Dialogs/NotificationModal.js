import React, { useCallback } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const NotificationModal = (
  props = {
    open: false,
    setOpen: false,
    handleOK: () => {},
    handleCancel: () => {},
    NotificationMessage: "",
    CancelButtonText: "Cancel",
    OkButtonText: "Ok",
  }
) => {
  const handleClose = useCallback(() => {
    props.setOpen(false);
    alert("notification modal close");
    props.handleCancel();
  }, [props]);

  return (
    <Dialog
      open={props.open}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Choose"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {props.NotificationMessage}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{props.CancelButtonText}</Button>
        <Button onClick={props.handleOK}>{props.OkButtonText}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(NotificationModal);
