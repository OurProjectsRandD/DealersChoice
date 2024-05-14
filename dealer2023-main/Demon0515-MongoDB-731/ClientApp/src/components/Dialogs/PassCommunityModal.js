import React, { useCallback } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useSelector } from "react-redux";

const PassCommunityModal = (
  props = {
    open: false,
    setOpen: false,
    dealCardToCommunity: () => {},
  }
) => {
  const gameState = useSelector((state) => state.gameState);

  const handleClose = useCallback(() => {
    props.setOpen(false);
  }, [props]);

  return (
    <Dialog
      open={props.open}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Choose Community"}</DialogTitle>
      <DialogContent>
        {Array.apply(null, Array(gameState.NumberOfCommunities)).map(
          (obj, index) => (
            <button
              key={index}
              className="btn"
              onClick={() => props.dealCardToCommunity(index)}
            >
              {index + 1}
            </button>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PassCommunityModal;
