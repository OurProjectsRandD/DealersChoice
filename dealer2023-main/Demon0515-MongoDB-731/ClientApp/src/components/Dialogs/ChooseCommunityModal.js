import React, { useCallback, useMemo } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useDispatch, useSelector } from "react-redux";
import { PassCards, ReturnToDeck, Show } from "../../common/game/GameControl";
import { passCard, returnToDeck, show } from "../../slice/gameStateSlice";

const ChooseCommunityModal = (
  props = {
    open: false,
    setOpen: false,
    Card: {
      Value: "",
    },
  }
) => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);

  const cardImage = useMemo(() => {
    if (typeof props.Card.Value === "undefined") return "";
    return props.Card.Value.length === 3
      ? props.Card.Value[2] + props.Card.Value[0] + props.Card.Value[1]
      : props.Card.Value[1] + props.Card.Value[0];
  }, [props.Card]);

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );

  const handleClose = useCallback(() => {
    props.setOpen(false);
  }, [props]);

  const takeHandler = useCallback(() => {
    PassCards(
      user.Id,
      gameState.GameCode,
      [props.Card],
      currentIndex,
      0,
      () => {
        dispatch(
          passCard({
            draggingCards: [props.Card],
            Index: currentIndex,
            Type: 0,
          })
        );
        props.setOpen(false);
      }
    );
  }, [currentIndex, dispatch, gameState, props.Card, user.Id]);

  const moveToDeckHandler = useCallback(() => {
    ReturnToDeck(
      user.Id,
      gameState.GameCode,
      currentIndex,
      [props.Card],
      () => {
        dispatch(
          returnToDeck({
            Index: currentIndex,
            selectedCards: [props.Card],
          })
        );
        props.setOpen(false);
      }
    );
  }, [currentIndex, dispatch, gameState.GameCode, props.Card, user.Id]);

  const showHandler = useCallback(() => {
    Show(user.Id, gameState.GameCode, currentIndex, [props.Card], 1, () => {
      dispatch(
        show({
          selectedCards: [props.Card],
          Index: currentIndex,
        })
      );
      props.setOpen(false);
    });
  }, [currentIndex, dispatch, gameState.GameCode, props.Card, user.Id]);

  return (
    <Dialog
      open={props.open}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Community Card"}</DialogTitle>
      <DialogContent>
        <div className="imgSelectedCard">
          <img
            alt=""
            src={"/assets/Cards/" + cardImage + ".png"}
            id="SelectedCommunityCard"
            style={{ width: "50px", height: "100px" }}
          />
        </div>
        <label>Actions</label>
        <div className="TakeCommunityCard">
          <button className="btn" onClick={takeHandler}>
            Take
          </button>
          <button className="btn" onClick={showHandler}>
            Show
          </button>
          {user.Id === gameState.DealerId && (
            <button className="btn TakeToCommunity" onClick={moveToDeckHandler}>
              Move to deck
            </button>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChooseCommunityModal;
