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
      {videoStream ? (
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
      ) : (
        <div>No video available</div>
      )}
    </div>
  );
};

const Player = ({ ptr }) => {
  const [toggleRemoveButtonVisible, setToggleRemoveButtonVisible] =
    useState(false);

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

  const Drop = useCallback(
    (ev) => {
      try {
        $(".fas").removeClass("Droppable");
        ev.preventDefault();
      } catch (ex) {
        alert("drop at the right place!");
      }
      PassCards(
        user.Id,
        gameState.GameCode,
        [draggingCard],
        PlayerIndex,
        0,
        () => {
          //change state if successful
          dispatch(
            passCard({
              draggingCards: [draggingCard],
              Index: PlayerIndex,
              Type: 0,
            })
          );
        }
      );
    },
    [PlayerIndex, dispatch, draggingCard, gameState.GameCode]
  );

  const AllowDrop = useCallback((ev) => {
    $(".fas").addClass("Droppable");
    ev.preventDefault();
  }, []);

  const DragEnd = useCallback((ev) => {
    $(ev.target).removeClass("Droppable");
    ev.preventDefault();
  }, []);

  const RemovePlayer = useCallback(
    (Player) => {
      KickPlayer(gameState.GameCode, PlayerIndex, () => {
        dispatch(playerLeft(PlayerIndex));
        LogRocket.log("Kicked Player " + Player.PlayerName, {
          GameCode: gameState.GameCode,
          GameHash: gameState,
        });
      });
    },
    [PlayerIndex, dispatch, gameState]
  );

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
            onClick={() =>
              setToggleRemoveButtonVisible(!toggleRemoveButtonVisible)
            }
          >
            <div className="PlayerDealer">{Player.PlayerName}</div>
            {gameState.GameCreatorId === user.Id && (
              <span
                className="PlayerStatusNet col-auto px-2 my-auto mx-2 btn"
                onClick={() => RemovePlayer(Player)}
              >
                <i class="bi bi-trash"></i>
              </span>
            )}
            <span className="PlayerStatusNet col-auto px-2 my-auto">
              {Player.PlayerNetStatusFinal + Player.PlayerAmount}
            </span>
            {Player.PlayerId === gameState.DealerId && (
              <span className="PlayerStatusNet col-auto px-2 my-auto dealerIconStyle">
                D
              </span>
            )}
          </div>
          {/* {gameState.GameCreatorId === user.Id && toggleRemoveButtonVisible && (
            <button className="btn" onClick={() => RemovePlayer(Player)}>
              Remove {Player.PlayerName}
            </button>
          )} */}
        </div>
        <div
          id={"Player" + ptr}
          onDrop={(ev) => Drop(ev)}
          onDragOver={AllowDrop}
          onDragEnd={DragEnd}
          onDragLeave={DragEnd}
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
        <div className="PlayerDeck">
          {Player.PlayerCards &&
            Player.PlayerCards.map((obj, index) => {
              return (
                <Cards
                  obj={obj}
                  playerIndex={PlayerIndex}
                  handleClick={() => alert("Card does not belong to you.")}
                  key={obj.Value}
                />
              );
            })}
        </div>
        <span className="PlayerAction badge badge-primary mx-auto">
          {Player.LastActionPerformed}
        </span>
      </div>
    </div>
  );
};

export default Player;
