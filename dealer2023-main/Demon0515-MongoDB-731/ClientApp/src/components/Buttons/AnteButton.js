import React, { useCallback, useMemo } from "react";
import { Ante } from "../../common/game/GameControl";
import { useDispatch, useSelector } from "react-redux";
import { ante } from "../../slice/gameStateSlice";

const AnteButton = ({ txtAnteRef }) => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );

  const AnteEventHandler = useCallback(
    (ev) => {
      if (
        gameState.ActivePlayers.filter(
          (x) => x.IsFolded === false && x.PlayerId !== gameState.DealerId
        ).length > 0
      ) {
        const anteValue = parseInt(txtAnteRef.current.value);
        if (isNaN(anteValue)) {
          alert("Input Correct Number!");
          return;
        }
        if (anteValue <= 0) {
          alert("Input value greater than 0");
          return;
        }
        if (anteValue >= 10000) {
          alert("Input value less than 10000");
          return;
        }
        Ante(user.Id, gameState.GameCode, currentIndex, anteValue, () => {
          dispatch(
            ante({
              Index: currentIndex,
              Amount: anteValue,
              GameCode: gameState.GameCode,
            })
          );
          txtAnteRef.current.value = "";
        });
      }

      // If not
      else {
        alert("No Active Player");
      }
    },
    [currentIndex, gameState, txtAnteRef]
  );
  return (
    <button className="btn btn Ante mt-0" onClick={AnteEventHandler}>
      Ante
    </button>
  );
};

export default AnteButton;
