import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Endhand } from "../../common/game/GameControl";
import { endHandAction } from "../../slice";

const EndHandButton = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.newGameState);
  const user = useSelector((state) => state.auth.user);

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );

  const SettelEventHandler = useCallback(
    (ev) => {
      Endhand(user.Id, gameState.GameCode, currentIndex, () => {
        dispatch(endHandAction(currentIndex));
      });
    },
    [user.Id, gameState, currentIndex, dispatch]
  );

  if (gameState.DealerId === user.Id)
    return (
      <>
        <button
          className="btn BtnSettle me-2 mt-2"
          onClick={SettelEventHandler}
        >
          End hand
        </button>
      </>
    );
  else return <></>;
};

export default EndHandButton;
