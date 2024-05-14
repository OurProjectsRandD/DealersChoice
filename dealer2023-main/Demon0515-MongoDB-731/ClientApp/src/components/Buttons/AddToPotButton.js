import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AddToPot } from "../../common/game/GameControl";
import { addToPot } from "../../slice/gameStateSlice";

const AddToPotButton = ({ BetTakeValueRef }) => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );

  const AddToPotEventHandler = useCallback(
    (ev) => {
      // logic
      try {
        const betamount = parseInt(BetTakeValueRef.current.value); // for active user

        if (isNaN(betamount)) {
          alert("Input Correct Number!");
          return;
        }

        // check betamount is at least 1.
        if (betamount < 1) {
          alert("minimum amount: 1");
          return;
        } else {
          AddToPot(user.Id, gameState.GameCode, currentIndex, betamount, () => {
            dispatch(
              addToPot({
                GameCode: gameState.GameCode,
                Index: currentIndex,
                Amount: betamount,
              })
            );
          });
        }
        // initialize BetTakeValue to 1.
        BetTakeValueRef.current.value = "";
      } catch (err) {
        //GameLogging(err, 2);
      }
    },
    [BetTakeValueRef, currentIndex, dispatch, gameState, user]
  );
  return (
    <button
      className="btn AddToPot ml-1 mt-1 mr-1"
      onClick={AddToPotEventHandler}
    >
      Add to pot
    </button>
  );
};

export default AddToPotButton;
