import { useMeeting } from "@videosdk.live/react-sdk";
import React, { useCallback, useState,useEffect } from "react";
import {
  EndVideoMeeting,
  StartVideoMeeting,
  checkIfJoinedMeeting,
} from "../../common/game/GameControl";
import {useDispatch, useSelector } from "react-redux";
import { setCameraStatus,setCameraStatusoff} from "../../slice/cameraStatusSlice";

const Loader = () => {
  return (
    <div className="loader">
      <div className="loader-spinner"></div>
    </div>
  );
};

const StartVideo = () => {
  const user = useSelector((state) => state.auth.user);
  const gameState = useSelector((state) => state.gameState);
  const isMeetingJoined = useSelector((state) => state.auth.isMeetingJoined);
  const dispatch = useDispatch();
  // const isCameraOnstartvideo = useSelector((state) => state.cameraStatus.isCameraOn);
  /* const [joining, setJoining] = useState(false); */
  const [loading, setLoading] = useState(false); // State to track loading status

  const meetingAPI = useMeeting({});

  const startVideo = useCallback(async () => {
    //StartVideoMeeting(user.Id, gameState.GameCode, () => {
    /*  setJoining(true); */
    setLoading(true); // Start loading
   await meetingAPI.join();
      //});
    setTimeout(() => {
      setLoading(false); // Stop loading
      console.log("starting..............");
      dispatch(setCameraStatus(true));
    }, 6000);
  }, [user.Id, gameState.GameCode,meetingAPI]);

  const endVideo = useCallback(() => {
    //EndVideoMeeting(user.Id, gameState.GameCode, () => {
    /* setJoining(false); */
    setLoading(true); // Start loading
    if (gameState.GameCreatorId === user.Id) {
      EndVideoMeeting(user.Id, gameState.GameCode, async () => {
        // meetingAPI.end().then(() => {
        //   setLoading(false); 
        //   console.log("ending...........")// Stop loading
        // });
        meetingAPI.end();
        
      });
      setTimeout(() => {
        setLoading(false); // Stop loading
        console.log("ending..............");
        dispatch(setCameraStatus(false))

      }, 6000);
    } else {
      meetingAPI.leave();
    }
    //});
  }, [user.Id, gameState.GameCode, gameState.GameCreatorId]);

  useEffect(() => {
    // Simulate clicking the Start Video button after page load
    startVideo();
  }, []);
  if (loading) {
    return <h1>Loading....

    </h1>; // Show the loader while the action is in progress
  }
  
  // if (loading) {
  //   return < Loader />
  // }
  if (!isMeetingJoined)
    return (
      <button
        className="btn ml-1 mt-1 mr-1"
        onClick={startVideo}
        /* disabled={joining} */
      >
        Start Video
      </button>
    );
  else
    return (
      <button className="btn m1-1 mt-1 mr-1" onClick={endVideo}>
        End Video
      </button>
    );
};

export default StartVideo;
