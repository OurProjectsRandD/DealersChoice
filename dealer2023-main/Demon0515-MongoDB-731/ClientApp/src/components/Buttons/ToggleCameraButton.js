import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { useDispatch, useSelector } from "react-redux";
import {
  ToggleCamera,
  checkIfJoinedMeeting,
  ToggleMic
} from "../../common/game/GameControl";
import { toggleCamera, handleCamera, handleMic, toggleMic, toggleMicforrefresh } from "../../slice/gameStateSlice";
import { setCameraStatus, setCameraStatusoff } from "../../slice/cameraStatusSlice";

const ToggleCameraButton = () => {
  const meetingAPI = useMeeting();
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const isMeetingJoined = useSelector((state) => state.auth.isMeetingJoined);
  const user = useSelector((state) => state.auth.user);
  const isCameraOn = useSelector((state) => state.cameraStatus.isCameraOn);
  // const isCameraoff = useSelector((state) => state.cameraStatus.isCameraOff);

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );
  const currentPlayer = useMemo(() => {
    if (currentIndex === -1) return {};
    return gameState.ActivePlayers[currentIndex];
  }, [currentIndex, gameState.ActivePlayers]);

  useEffect(async () => {
    console.log(" =====>  01 ");
    if (user.Id && gameState.GameCode && currentIndex !== -1) {
      meetingAPI.enableWebcam();
      meetingAPI.unmuteMic();

      ToggleCamera(user.Id, gameState.GameCode, currentIndex,true, () => {
        console.log("useEffect first time only for camera ", currentPlayer.IsRealTimeChat);
        dispatch(handleCamera({ index: currentIndex, value: true }));
      });

      ToggleMic(user.Id, gameState.GameCode, currentIndex, true, () => {
        console.log("useEffect first time only for mic ", currentPlayer.IsRealTimeChatForMic);
        dispatch(handleMic({ index: currentIndex, value: true }));
      });
    }

  }, []);

  // console.log(  "user name is ==>",currentIndex, currentPlayer.PlayerName, " check mic ", currentPlayer.IsRealTimeChatForMic, currentPlayer);


  const handleWebCamera = (status) => {
    if (status && !currentPlayer.IsRealTimeChat) {
      console.log("check status and DB camera value ==>  camera off, need to On");
      meetingAPI.enableWebcam();
    } else {
      console.log("Camera Off");
      meetingAPI.disableWebcam();
    }

    ToggleCamera(user.Id, gameState.GameCode, currentIndex,status,() => {
      console.log("Toggle  01 ");
      dispatch(handleCamera({ index: currentIndex, value: status }));
    });
  }

  const handleWebMic = (status) => {
    if (status && !currentPlayer.IsRealTimeChatForMic) {
      console.log("check status and DB Mic value ==>  Mic off, need to On");
      meetingAPI.unmuteMic();
    } else {
      meetingAPI.muteMic();
      console.log("Mic Off");

    }

    ToggleMic(user.Id, gameState.GameCode, currentIndex,status, () => {
      dispatch(handleMic({ index: currentIndex, value: status }));
    });
  }



  if (!isMeetingJoined) return <></>;

  if (!currentPlayer.IsRealTimeChat)
    return (
      <>

        <button 
          className="btn ml-1 mt-1 stencil"
          style={{ color: "white" }}
          onClick={() => handleWebCamera(true)}
        >
          <i className="bi bi-camera-video-off h4"></i>
        </button>
        
        {currentPlayer.IsRealTimeChatForMic ? (
          // Render this if IsRealTimeChatForMic is true
          <button
            className="btn ml-1 mt-1 stencil"
            style={{ color: "white" }}
            onClick={() => handleWebMic(false)}
          >
            <i className="bi bi-mic-fill h4"></i>
          </button>
        ) : (
          // Render this if IsRealTimeChatForMic is false
          <button 
            className="btn ml-1 mt-1 stencil"
            style={{ color: "white" }}
            onClick={() => handleWebMic(true)}
          >
            <i className="bi bi-mic-mute-fill h4"></i>
          </button>
        )}
      </>
    );
  else if (currentPlayer.IsRealTimeChat)
    return (
      <>
        <button
          className="btn ml-1 mt-1 stencil"
          style={{ color: "white" }}
          onClick={() => handleWebCamera(false)}
        >
          <i className="bi bi-camera-video h4"></i>
        </button>
        {/* Conditionally render microphone button */}
        {currentPlayer.IsRealTimeChatForMic ? (
          // Render this if IsRealTimeChatForMic is true
          <button
            className="btn ml-1 mt-1 stencil"
            style={{ color: "white" }}
            onClick={() => handleWebMic(false)}
          >
            <i className="bi bi-mic-fill h4"></i>
          </button>
        ) : (
          // Render this if IsRealTimeChatForMic is false
          <button 
            className="btn ml-1 mt-1 stencil"
            style={{ color: "white" }}
            onClick={() => handleWebMic(true)}
          >
            <i className="bi bi-mic-mute-fill h4"></i>
          </button>
        )}


      </>
    );
};

export default ToggleCameraButton;
