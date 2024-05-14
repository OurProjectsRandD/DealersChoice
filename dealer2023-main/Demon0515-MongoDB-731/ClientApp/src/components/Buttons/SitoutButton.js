import React, { useCallback, useMemo } from "react";
import { Rejoin, Sitout } from "../../common/game/GameControl";
import { rejoin, sitout } from "../../slice/gameStateSlice";
import { useDispatch, useSelector } from "react-redux";

const SitOutButton = () => {
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

  const SitOutEventHandler = useCallback(
    async (ev) => {
      Sitout(user.Id, gameState.GameCode, currentIndex, () => {
        dispatch(sitout(currentIndex));
      });
    },
    [currentIndex, dispatch, gameState, user.Id]
  );

  const RejoinEventHandler = useCallback(
    async (ev) => {
      // Perform SitOut action
      Rejoin(user.Id, gameState.GameCode, currentIndex, () => {
        dispatch(rejoin(currentIndex));
      });
    },
    [currentIndex, dispatch, gameState, user.Id]
  );

  return (
    <>
      {currentPlayer.IsSitOut ? (
        <button
          className="btn btn-primary BtnRejoin"
          onClick={RejoinEventHandler}
        >
          Rejoin
        </button>
      ) : (
        <button
          className="btn btn-primary BtnSitOut"
          onClick={SitOutEventHandler}
        >
          Sit Out
        </button>
      )}
    </>
  );
};

export default SitOutButton;
