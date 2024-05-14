import React, { useCallback } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { decreaseVideoMinutes } from "../../common/game/GameControl";
import { useDispatch, useSelector } from "react-redux";
import { setVideoTime } from "../../slice/authSlice";

const EndMeetingButton = ({ isMeetingJoined }) => {
  const meetingAPI = useMeeting();
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);

  const endMeeting = useCallback(() => {
    meetingAPI.end();
  }, [gameState]);
  /* 
  const leftMeeting = useCallback(() => {
    meetingAPI.leave();
  }, []);

  const joinMeeting = useCallback(() => {
    meetingAPI.join();
  }, []);
 */
  //only creator show
  if (isMeetingJoined && gameState.GameCreatorId === user.Id)
    return (
      <>
        <button
          className="btn ml-1 mt-1"
          style={{ color: "white" }}
          onClick={endMeeting}
        >
          End Meeting
        </button>
      </>
    );
  else return <></>;
};

export default EndMeetingButton;
