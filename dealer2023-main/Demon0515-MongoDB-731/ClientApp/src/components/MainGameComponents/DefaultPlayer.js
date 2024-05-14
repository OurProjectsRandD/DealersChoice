import React, {
    useCallback,
    useMemo,
    useRef,
    useEffect,
    useState,
  } from "react";
  import Cards from "./Cards";
  import $ from "jquery";
  import LogRocket from "logrocket";
  import ReactPlayer from "react-player";
  import { useParticipant } from "@videosdk.live/react-sdk";
  import { useDispatch, useSelector } from "react-redux";
  import { PassCards, KickPlayer } from "../../common/game/GameControl";
  import { passCard, playerLeft } from "../../slice/gameStateSlice";
  
  const ParticipantView = ({ participantId }) => {
    const micRef = useRef(null);
  
    const meetingAPI = useParticipant(participantId);
  
    const videoStream = useMemo(() => {
      if (meetingAPI.webcamOn && meetingAPI.webcamStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(meetingAPI.webcamStream.track);
        return mediaStream;
      }
    }, [meetingAPI.webcamStream, meetingAPI.webcamOn]);
  
    useEffect(() => {
      if (micRef.current) {
        if (meetingAPI.micOn && meetingAPI.micStream) {
          const mediaStream = new MediaStream();
          mediaStream.addTrack(meetingAPI.micStream.track);
  
          micRef.current.srcObject = mediaStream;
          micRef.current
            .play()
            .catch((error) =>
              console.error("videoElem.current.play() failed", error)
            );
        } else {
          micRef.current.srcObject = null;
        }
      }
    }, [meetingAPI.micStream, meetingAPI.micOn]);
  
    return (
      <div className="player-wrapper">
        <audio ref={micRef} autoPlay muted={meetingAPI.isLocal} />
        <ReactPlayer
          playsinline
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          url={videoStream}
          className="react-player"
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      </div>
    );
  };
  
  const DefaultPlayer = ({ ptr }) => {
  
    const gameState = useSelector((state) => state.gameState);
    const user = useSelector((state) => state.auth.user);
    const draggingCard = useSelector((state) => state.card.draggingCard);
    const dispatch = useDispatch();
  
    const currentIndex = useMemo(
      () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
      [gameState.ActivePlayers, user.Id]
    );
  
    const PlayerIndex = useMemo(() => {
      let index = (currentIndex + (ptr - 1)) % 6;
      if (index >= gameState.ActivePlayers.length) return -1;
      return index;
    }, [currentIndex, gameState.ActivePlayers.length, ptr]);
  
    const Player = useMemo(() => {
      if (PlayerIndex === -1) return null;
      return gameState.ActivePlayers[PlayerIndex];
    }, [PlayerIndex, gameState.ActivePlayers]);
  
  
    if (PlayerIndex === -1) return <></>;
  
    return (
      <div
        className={
          "Player" +
          ptr +
          " Player" +
          (Player.IsFolded || Player.IsDisconnected ? " PlayerFolded" : "") +
          (gameState.CurrentId === Player.PlayerId && gameState.Deck.length < 52
            ? " bg-active"
            : "")
        }
        data-sliderindex="0"
      >
        <div>
          <div className="row m-0 p-1">
            <div
              className={`PlayerName col${
                gameState.DealerId === Player.PlayerId ? " green" : ""
              }`}
            >
              {Player.PlayerName}
            </div>
          </div>
          <div
            id={"Player" + ptr}
          >
            {Player.IsRealTimeChat ? (
              <ParticipantView participantId={Player.PlayerId} />
            ) : Player.PlayerImage.length > 0 ? (
              <img
                alt=""
                src={"/" + Player.PlayerImage}
                style={{ width: "200px", height: "200px" }}
              />
            ) : (
              <i className={"fas fa-user"}></i>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default DefaultPlayer;
  