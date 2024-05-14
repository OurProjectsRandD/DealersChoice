import React, { useCallback, useEffect, useState } from "react";
import "../../css/MainGame.css";
import { useDispatch, useSelector } from "react-redux";
import { LockGame } from "../../common/game/GameControl";
import { toggleLock } from "../../slice/gameStateSlice";

const LockGameButton = () => {
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);
  const isAuthorized = useSelector((state) => state.auth.isAuthorized);
  const dispatch = useDispatch();

  const clickEventHandler = useCallback(() => {
    LockGame(user.Id, gameState.GameCode, () => {
      dispatch(toggleLock());
    });
  }, [gameState.GameCode, user.Id]);

  if (user.Id === gameState.GameCreatorId && isAuthorized)
    return (
      <button className="btn BtnCancelHand m-2" onClick={clickEventHandler}>
        {gameState.IsLocked ? "UnLock Game" : "Lock Game"}
      </button>
    );
  else return <></>;
};

export default LockGameButton;
