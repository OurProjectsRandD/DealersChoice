import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Fold } from "../../common/game/GameControl";
import { fold } from "../../slice/gameStateSlice";

const FoldButton = () => {
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

  const FoldEventHandler = useCallback(
    (ev) => {
      Fold(user.Id, gameState.GameCode, currentIndex, () => {
        dispatch(fold(currentIndex));
      });
    },
    [currentIndex, dispatch, gameState, user]
  );
  if (gameState.CurrentId === user.Id && currentPlayer.PlayerCards.length > 0)
    return (
      <button className="btn Fold ml-1 mt-1" onClick={FoldEventHandler}>
        Fold
      </button>
    );
  return <></>;
};

export default FoldButton;
