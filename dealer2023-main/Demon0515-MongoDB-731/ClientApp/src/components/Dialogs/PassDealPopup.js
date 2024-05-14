import React, { useCallback } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { GetUserNameFromPlayerId } from "../../common/game/basic";
import { useDispatch, useSelector } from "react-redux";
import { PassDeal } from "../../common/game/GameControl";
import { passDeal } from "../../slice/gameStateSlice";

const PassDealPopUp = (props = { open: false, setOpen: false }) => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);
  const handleClose = useCallback(() => {
    props.setOpen(false);
  }, [props]);

  const PassDealPlayer = useCallback(
    (dealerId) => {
      PassDeal(user.Id, gameState.GameCode, dealerId, () => {
        dispatch(passDeal(dealerId));
      });
    },
    [dispatch, gameState.GameCode, user.Id]
  );

  return (
    <Dialog
      open={props.open}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Choose"}</DialogTitle>
      <DialogContent>
        {gameState.ActivePlayers.filter(
          (x) =>
            x.IsFolded === false &&
            x.IsDisconnected === false &&
            x.PlayerId !== user.Id
        ).map((player, index) => (
          <button
            key={index}
            className="btn"
            onClick={() => PassDealPlayer(player.PlayerId)}
          >
            {player.PlayerName}
          </button>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PassDealPopUp;
