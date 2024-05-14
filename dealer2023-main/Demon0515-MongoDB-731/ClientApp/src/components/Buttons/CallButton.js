import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { call } from "../../slice/gameStateSlice";
import { Call } from "../../common/game/GameControl";

const CallButton = ({ CurrentPlayer, gameHash, Sno, OnPlayerAction }) => {
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

  const CallEventHandler = useCallback(
    (ev) => {
      // You can only call when Current Bet is more than 0.
      if (gameState.CurrentBet === 0) {
        alert("Cannot call on bet - 0");
      } else {
        Call(user.Id, gameState.GameCode, currentIndex, () => {
          dispatch(call(currentIndex));
        });
      }
    },
    [currentIndex, dispatch, gameState, user]
  );

  if (
    gameState.CurrentId === user.Id &&
    currentPlayer.PlayerCards.length > 0 &&
    gameState.CurrentBet > 0
  )
    return (
      <button className="btn Call ml-1 mt-1" onClick={CallEventHandler}>
        Call
      </button>
    );
  return <></>;
};

export default CallButton;
