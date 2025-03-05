import { useMeeting } from "@videosdk.live/react-sdk";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  EndVideoMeeting,
  Endgame,
  decreaseVideoMinutes,
} from "../../common/game/GameControl";
import SettlementModalEndGame from "../Dialogs/SettlementModalEndGame";
import { setVideoTime } from "../../slice/authSlice";
import { endGameAction } from "../../slice";

const GameOverButton = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.newGameState);
  const user = useSelector((state) => state.auth.user);

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );

  const meetingAPI = useMeeting();

  const [settlementModalEndGameOpen, setSettlementModalEndGameOpen] =
    useState(false);

  const BackToMenuEventHandler = useCallback(
    async (ev) => {
      if (gameState.PotSize > 0) {
        alert(
          "Game cannot be ended when pot is not settled. Please distribute the Pot First"
        );
        return;
      }

      Endgame(user.Id, gameState.GameCode, currentIndex, () => {
        dispatch(endGameAction());
        setSettlementModalEndGameOpen(true);
        // Show Summary
        if (meetingAPI !== undefined) {
          try {
            EndVideoMeeting(user.Id, gameState.GameCode, () => {
              meetingAPI.end();
            });
          } catch (e) {
            console.log("end meeting error", e);
          }
        }
      });
    },
    [currentIndex, gameState, meetingAPI, user, dispatch]
  );

  if (user.Id === gameState.GameCreatorId)
    return (
      <>
        <button
          className="btn BackToMenu me-2 mt-2"
          onClick={BackToMenuEventHandler}
        >
          Game Over
        </button>
        <SettlementModalEndGame
          isShow={false}
          gameState={gameState}
          open={settlementModalEndGameOpen}
          setOpen={setSettlementModalEndGameOpen}
        />
      </>
    );
  return <></>;
};

export default GameOverButton;
