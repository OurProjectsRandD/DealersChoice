import React, { useCallback } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useDispatch, useSelector } from "react-redux";
import { PassCards } from "../../common/game/GameControl";
import { setSelectedCards } from "../../slice/cardSlice";
import { passCard } from "../../slice/gameStateSlice";

const PassCardModal = (
  props = {
    open: false,
    setOpen: false,
  }
) => {
  const user = useSelector((state) => state.auth.user);
  const gameState = useSelector((state) => state.gameState);
  const selectedCards = useSelector((state) => state.card.selectedCards);
  const dispatch = useDispatch();
  const handleClose = useCallback(() => {
    props.setOpen(false);
  }, [props]);
  const handlePassCard = useCallback(
    (index, type) => {
      PassCards(user.Id, gameState.GameCode, selectedCards, index, type, () => {
        dispatch(
          passCard({
            draggingCards: selectedCards,
            Index: index,
            Type: type,
          })
        );
      });
      dispatch(setSelectedCards([]));
      props.setOpen(false);
    },
    [dispatch, gameState.GameCode, props, selectedCards, user.Id]
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
        {gameState.ActivePlayers.map((obj, index) => {
          if (obj.PlayerId === user.Id) return <></>;
          return (
            <button
              className="btn"
              key={index}
              onClick={() => handlePassCard(index, 0)}
              style={{ border: "none", marginTop: "3%", marginLeft: "1%" }}
            >
              {obj.PlayerName}
            </button>
          );
        })}
        {Array.apply(null, Array(gameState.NumberOfCommunities)).map(
          (obj, index) => (
            <button
              key={index}
              className="btn"
              onClick={() => handlePassCard(index, 1)}
              style={{ border: "none", marginTop: "3%", marginLeft: "1%" }}
            >
              Community {index + 1}
            </button>
          )
        )}
        {gameState.ActivePlayers.length === 0 && "No active players"}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PassCardModal;
