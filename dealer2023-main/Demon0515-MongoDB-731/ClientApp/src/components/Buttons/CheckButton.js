import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check } from "../../common/game/GameControl";
import { check } from "../../slice/gameStateSlice";

const CheckButton = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );

  const currentPlayer = useMemo(() => {
    if (currentIndex === -1) return {};
    return gameState.ActivePlayers[currentIndex];
  }, [currentIndex, gameState.ActivePlayers]);

  const CheckEventHandler = useCallback(
    (ev) => {
      Check(user.Id, gameState.GameCode, currentIndex, () => {
        dispatch(check(currentIndex));
      });
    },
    [currentIndex, dispatch, gameState, user]
  );
  if (
    gameState.CurrentId === user.Id &&
    currentPlayer.PlayerCards.length > 0 &&
    gameState.CurrentBet === 0
  ) {
    return (
      <button className="btn Pass ml-1 mt-1" onClick={CheckEventHandler}>
        Check
      </button>
    );
  }
};

export default CheckButton;
