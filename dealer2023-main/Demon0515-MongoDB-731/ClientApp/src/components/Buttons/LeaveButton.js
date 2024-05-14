import React, { useCallback, useMemo, useState } from "react";
import MyModalLeave from "../Dialogs/MyModalLeave";
import { useMeeting } from "@videosdk.live/react-sdk";
import { useDispatch, useSelector } from "react-redux";
import {
  EndVideoMeeting,
  LeaveGame,
  decreaseVideoMinutes,
} from "../../common/game/GameControl";
import { setVideoTime, setMeetingJoined } from "../../slice/authSlice";
import { useNavigate } from "react-router-dom";

const LeaveButton = () => {
  const navigator = useNavigate();
  const [myModalLeaveOpen, setMyModalLeaveOpen] = useState(false);
  const meetingAPI = useMeeting({
    onMeetingLeft: () => { },
  });

  const LeaveEventHandler = useCallback((ev) => {
    setMyModalLeaveOpen(true);
  }, []);

  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );

  const Leave_YesEventHandler = useCallback(
    (ev) => {
      LeaveGame(gameState.GameCode, currentIndex, () => {
        if (meetingAPI !== undefined) {
          try {
            if (gameState.GameCreatorId === user.Id) {
              EndVideoMeeting(user.Id, gameState.GameCode, () => {
                meetingAPI.end();
                dispatch(setMeetingJoined(false));
              });
            } else {
              //leave meeting
              meetingAPI.leave();
              dispatch(setMeetingJoined(false));
            }
          } catch (e) {
            console.log("leave game error", e);
          }
        }
      });
      navigator("/");
    },
    [currentIndex, gameState, meetingAPI, user.Id]
  );

  return (
    <>
      <button
        className="btn btn-outline-danger BtnLeave m-2"
        onClick={LeaveEventHandler}
      >
        Leave Game
      </button>
      <MyModalLeave
        open={myModalLeaveOpen}
        setOpen={setMyModalLeaveOpen}
        handleOK={Leave_YesEventHandler}
      />
    </>
  );
};

export default LeaveButton;
