import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../css/MainGame.css";
import "../../css/Font-Awesome.min.css";
import { SendRequest } from "../../util/AxiosUtil";
import Logging from "../../components/MainGameComponents/Logging";
import Player from "../../components/MainGameComponents/Player";
import DefaultPlayer from "../../components/MainGameComponents/DefaultPlayer";

import PotDiv from "../../components/MainGameComponents/PotDiv";
import CurrentPlayerDiv from "../../components/MainGameComponents/CurrentPlayer";
import DealerPanel from "../../components/MainGameComponents/DealerPanel";
import GameControlPanel from "../../components/MainGameComponents/GameControlPanel";
import LogRocket from "../../util/LogRocketUtil";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
} from "@videosdk.live/react-sdk";
import { authToken } from "../../util/VideoSDK";
import VideoMinutesRunOutNotification from "../../components/Dialogs/VideoMinutesRunOutNotfication";
import { useDispatch, useSelector } from "react-redux";
import {
  addToPot,
  ante,
  bet,
  call,
  cancelHand,
  check,
  dealCards,
  discard,
  endGame,
  endHand,
  fold,
  handleCamera,
  passCard,
  passDeal,
  playerConnected,
  playerDisconnected,
  playerJoin,
  playerLeft,
  rejoin,
  returnToDeck,
  setGameState,
  show,
  sitout,
  take,
  toggleCamera,
} from "../../slice/gameStateSlice";
import {
  decreaseVideoMinutes,
  startConnectionWithGameCodeAndUserId,
  decreaseVideoMinutesRuntime,
} from "../../common/game/GameControl";
import SettlementModalEndGame from "../../components/Dialogs/SettlementModalEndGame";
import { setMeetingJoined, setVideoTime } from "../../slice/authSlice";

const MainGame = ({ isVideoChatAllowed = false }) => {
  const stateRef = useRef();
  const navigator = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();

  //meeting related state
  const [isMeetingJoined, setIsMeetingJoined] = useState(false);
  const [timerId, setTimerId] = useState(-1);
  const [totalMinutes, setTotalMinutes] = useState(0);

  //modal visibility
  const [videoMinutesRunoutModalOpen, setVideoMinutesRunoutModalOpen] =
    useState(false);
  const [settlementModalEndGameOpen, setSettlementModalEndGameOpen] =
    useState(false);

  // redux states
  const user = useSelector((state) => state.auth.user);
  const asset = useSelector((state) => state.auth.asset);
  const gameState = useSelector((state) => state.gameState);
  const dispatch = useDispatch();
  const GameCode = searchParams.get("GameCode");
  const [connection, setConnection] = useState({});

  useEffect(() => {
    document.body.classList.remove("public");
    return () => {
      document.body.classList.add("public");
    };
  });

  const preventrefresh = (e) => {
    e.preventDefault();
    e.returnValue = "data will get lost";
    return e.returnValue; // Return the value
  };

  useEffect(() => {
    window.addEventListener("beforeunload", preventrefresh);

    return () => {
      window.removeEventListener("beforeunload", preventrefresh);
    };
  });
  // start connection with user.Id
  useEffect(() => {
    const startConnection = async () => {
      let newConnection = await startConnectionWithGameCodeAndUserId(
        GameCode,
        user.Id
      );
      LogRocket.log("Connected to SignalR", newConnection.connectionId);
      setConnection(newConnection);
      SendRequest({
        method: "POST",
        url: "Game/JoinGame",
        data: {
          GameCode: GameCode,
          UserId: user.Id,
          DisplayName: user.NickName,
          ConnectionId: newConnection.connectionId,
        },
      }).then((result) => {
        console.log("resultdat", result?.data);
        if (result.data === null || result.data === "") {
          alert(
            "Can't join game because of wrong game code, game is locked or didn't get invite"
          );
          navigator("/");
          return;
        }
        setIsLoading(false);
        dispatch(setGameState(result.data));
        LogRocket.log("Joined Game", result.data);
      });
    };
    startConnection();
  }, []);

  //VideoSDK related function

  stateRef.current = {
    gameHash: gameState,
    timerId: timerId,
    asset: asset,
    minutes: totalMinutes,
    isCreator: gameState.GameCreatorId === user.Id,
  };

  const meetingAPI = useMeeting({
    onMeetingJoined: () => {
      // alert("meeting joined");
      dispatch(setMeetingJoined(true));
      // meetingAPI.unmuteMic();
      // meetingAPI.enableWebcam();
      if (stateRef.current.isCreator) {
        let intervalId = setInterval(async () => {
          console.log("Outside===Open");
          decreaseVideoMinutesRuntime(
            stateRef.current.gameHash,
            dispatch,
            setVideoTime
          );
          console.log(
            `${stateRef.current.minutes} stateRef.current.minutes +${stateRef.current.gameHash.ActivePlayers.length} stateRef.current.gameHash.ActivePlayers.length`
          );
          console.log(
            stateRef.current.minutes +
              stateRef.current.gameHash.ActivePlayers.length
          );
          console.log(
            `${parseInt(
              stateRef.current.asset.Tokens
            )} parseInt(stateRef.current.asset.Tokens)-${parseInt(
              10 * stateRef.current.gameHash.ActivePlayers.length
            )} parseInt(10 * stateRef.current.gameHash.ActivePlayers.length)`
          );
          console.log(
            parseInt(stateRef.current.asset.Tokens) -
              parseInt(10 * stateRef.current.gameHash.ActivePlayers.length)
          );
          console.log("Outside===Closed");
          if (
            stateRef.current.minutes +
              stateRef.current.gameHash.ActivePlayers.length >=
            parseInt(stateRef.current.asset.Tokens) -
              parseInt(10 * stateRef.current.gameHash.ActivePlayers.length)
          ) {
            console.log("Inside===Open");
            console.log(
              `${stateRef.current.minutes} stateRef.current.minutes +${stateRef.current.gameHash.ActivePlayers.length} stateRef.current.gameHash.ActivePlayers.length`
            );
            console.log(
              stateRef.current.minutes +
                stateRef.current.gameHash.ActivePlayers.length
            );
            console.log(
              `${parseInt(
                stateRef.current.asset.Tokens
              )} parseInt(stateRef.current.asset.Tokens)-${parseInt(
                10 * stateRef.current.gameHash.ActivePlayers.length
              )} parseInt(10 * stateRef.current.gameHash.ActivePlayers.length)`
            );
            console.log(
              parseInt(stateRef.current.asset.Tokens) -
                parseInt(10 * stateRef.current.gameHash.ActivePlayers.length)
            );
            console.log("Inside===Closed");
            setVideoMinutesRunoutModalOpen(true);
            await startConnectionWithGameCodeAndUserId(GameCode, user.Id).then(
              (result) => {
                console.log(result);
                // result.invoke
                result
                  .invoke(
                    "AlertNotifictionVideo",
                    "video will end in 2 minutes. the game will stay active.the host may purchase more video credits to continue"
                  )
                  .catch((err) => console.error(err));
              }
            );
          }

          //calculate estimated minutes
          setTotalMinutes(
            stateRef.current.minutes +
              stateRef.current.gameHash.ActivePlayers.length
          );
        }, 1000 * 60);
        setTimerId(intervalId);
      }
      LogRocket.log("Joined Meeting", meetingAPI.meetingId);
    },
    onMeetingLeft: () => {
      dispatch(setMeetingJoined(false));
      LogRocket.log("Left Meeting", meetingAPI.meetingId);
      clearInterval(stateRef.current.timerId);
      // if (stateRef.current.isCreator) {
      //   decreaseVideoMinutes(stateRef.current.gameHash, dispatch, setVideoTime);
      // }
    },
    onParticipantLeft: (participant) => {
      console.log(participant);
      LogRocket.log("Participant Left Meeting", meetingAPI.meetingId);
    },
  });

  useEffect(() => {
    console.log("connection id: " + connection.connectionId);
    if (connection.connectionId === undefined) return;

    connection.on("Join_Meeting", () => {
      meetingAPI.join();
    });

    connection.on("Leave_Meeting", () => {
      meetingAPI.leave();
    });

    if (!stateRef.current.isCreator) {
      connection.on("ReceiveAlertNotifictionVideo", (message) => {
        toast(message);
      });
    }

    connection.on("Other_Connected", (UserId, ConnectionId) => {
      dispatch(
        playerConnected({
          ConnectionId,
          UserId,
        })
      );
    });
    connection.on("Other_Disconnected", (UserId, ConnectionId) => {
      alert("Your Session Is Closed Due To Joining the Game In Other Browser");
      navigator("/");
    });
    connection.on(
      "Other_Joined",
      (userId, playerImage, userName, connectionId) => {
        dispatch(
          playerJoin({
            userId,
            playerImage,
            userName,
            connectionId,
          })
        );
      }
    );

    connection.on("PassCard", (draggingCards, currentIndex, type) => {
      dispatch(
        passCard({
          draggingCards: draggingCards.map((x) => ({
            Index: x.index,
            Type: x.type,
            Value: x.value,
            Presentation: x.presentation,
            CommunityIndex: x.communityIndex,
          })),
          Index: currentIndex,
          Type: type,
        })
      );
    });

    connection.on("Player_Left", (index, leftId) => {
      dispatch(playerLeft(index));
    });

    connection.on("Kicked_Out", () => {
      alert("You have been kicked");
      navigator("/");
    });

    connection.on("Player_Disconnected", (index) => {
      alert("Player_Disconnected");
      dispatch(playerDisconnected(index));
    });

    connection.on("Bet", (index, amount) => {
      dispatch(
        bet({
          Amount: amount,
          Index: index,
        })
      );
    });

    connection.on("Take", (index, amount) => {
      dispatch(
        take({
          Index: index,
          Amount: amount,
        })
      );
    });

    connection.on("Call", (index) => {
      dispatch(call(index));
    });

    connection.on("AddToPot", (index, amount) => {
      dispatch(
        addToPot({
          Index: index,
          Amount: amount,
        })
      );
    });

    connection.on("Ante", (index, amount) => {
      dispatch(
        ante({
          Index: index,
          Amount: amount,
        })
      );
    });

    connection.on("Cancel_Hand", () => {
      dispatch(cancelHand());
    });

    connection.on("Check", (index) => {
      dispatch(check(index));
    });

    connection.on("Discard", (draggingCards, index) => {
      dispatch(
        discard({
          selectedCards: draggingCards.map((x) => ({
            Index: x.index,
            Type: x.type,
            Value: x.value,
            Presentation: x.presentation,
            CommunityIndex: x.communityIndex,
          })),
          Index: index,
        })
      );
    });

    connection.on("ReturnToDeck", (draggingCards, index) => {
      dispatch(
        returnToDeck({
          selectedCards: draggingCards.map((x) => ({
            Index: x.index,
            Type: x.type,
            Value: x.value,
            Presentation: x.presentation,
            CommunityIndex: x.communityIndex,
          })),
          Index: index,
        })
      );
    });

    connection.on("Show", (draggingCards, index) => {
      dispatch(
        show({
          selectedCards: draggingCards.map((x) => ({
            Index: x.index,
            Type: x.type,
            Value: x.value,
            Presentation: x.presentation,
            CommunityIndex: x.communityIndex,
          })),
          Index: index,
        })
      );
    });

    connection.on("End_Hand", (index) => {
      dispatch(endHand(index));
    });

    connection.on("Fold", (index) => {
      dispatch(fold(index));
    });

    connection.on("Sitout", (index) => {
      dispatch(sitout(index));
    });

    connection.on("Rejoin", (index) => {
      dispatch(rejoin(index));
    });

    connection.on("Endgame", (index) => {
      dispatch(endGame(index));
      setSettlementModalEndGameOpen(true);
    });

    // connection.on("ToggleCamera", (index,status) => {

    //    debugger;
    //   console.log("Toggle  02 ToggleCamera connection signalR ", index);
    //   // dispatch(toggleCamera(index));
    //   //dispatch(handleCamera({ index, value: status }));
    // });

    connection.on("DealCards", (DealCards, action) => {
      dispatch(
        dealCards({
          dealCards: DealCards.map((x) => ({
            Index: x.index,
            Type: x.type,
            Value: x.value,
            Presentation: x.presentation,
            CommunityIndex: x.communityIndex,
          })),
          LastActionPerformed: action,
        })
      );
    });

    connection.on("PassDeal", (dealerId) => {
      dispatch(passDeal(dealerId));
    });
    return () => {
      connection.off("Other_Connected");
      connection.off("Other_Disconnected");
      connection.off("Other_Joined");
      connection.off("PassCard");
      connection.off("Player_Left");
      connection.off("Kicked_Out");
      connection.off("Player_Disconnected");
      connection.off("Bet");
      connection.off("Take");
      connection.off("Call");
      connection.off("AddToPot");
      connection.off("Ante");
      connection.off("Cancel_Hand");
      connection.off("Check");
      connection.off("Discard");
      connection.off("ReturnToDeck");
      connection.off("Show");
      connection.off("End_Hand");
      connection.off("Fold");
      connection.off("Sit_out");
      connection.off("Rejoin");
      connection.off("Endgame");
      //connection.off("ToggleCamera");
      connection.off("DealCards");
      connection.off("PassDeal");
      connection.off("ReceiveAlertNotifictionVideo");
    };
  }, [connection.connectionId]);

  if (!isLoading)
    return (
      <>
        <div className="container-fluid bg-black p-0" id="GameBoard">
          <div className="row">
            <Logging />
            <div className="col-10">
              <div className="row">
                <div
                  className="logging d-none col-12 alert alert-warning"
                  id="logging"
                >
                  <span>Game Started</span>
                </div>
                <hr />
              </div>
              <div
                className="row GeneralMessage"
                style={{ position: "fixed:", zIndex: 400, width: "60%" }}
              ></div>
              <div id="table">
                <div className="row"></div>
                <div className="row">
                  <div className="col-4 seat">
                    <Player ptr={3} dealerId={gameState.DealerId} />
                  </div>
                  <div className="col-4 seat">
                    <Player ptr={4} dealerId={gameState.DealerId} />
                  </div>
                  <div className="col-4 seat">
                    <Player ptr={5} dealerId={gameState.DealerId} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-4 seat">
                    <Player ptr={2} dealerId={gameState.DealerId} />
                  </div>
                  <div className="col-4" id="potdiv">
                    <PotDiv />
                  </div>
                  <div className="col-4 seat">
                    <Player ptr={6} dealerId={gameState.DealerId} />
                  </div>
                </div>
                <div className="row text-center mx-2 mt-2 mb-2">
                  <div className="col-10">
                    <CurrentPlayerDiv />
                  </div>
                  <div className="col-2">
                    <DefaultPlayer ptr={1} />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="text-center mx-auto col-12 text-center card bg-secondary align-self-center">
                  {gameState.DealerId === user.Id && <DealerPanel />}
                </div>
              </div>
              <div className="row">
                <GameControlPanel isMeetingJoined={isMeetingJoined} />
              </div>
            </div>
          </div>
        </div>
        <VideoMinutesRunOutNotification
          open={videoMinutesRunoutModalOpen}
          setOpen={setVideoMinutesRunoutModalOpen}
        />
        <ToastContainer />
        <SettlementModalEndGame
          isShow={false}
          gameState={gameState}
          open={settlementModalEndGameOpen}
          setOpen={setSettlementModalEndGameOpen}
        />
      </>
    );
  else return <h1>Loading...</h1>;
};

const MeetingProviderWrappedMainGame = () => {
  const user = useSelector((state) => state.auth.user);
  const [searchParams] = useSearchParams();
  const meetingId = searchParams.get("MeetingId");

  if (meetingId === null || authToken === null) {
    return <MainGame isVideoChatAllowed={false} />;
  } else {
    return (
      authToken && (
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: true,
            webcamEnabled: true,
            name: user.DisplayName,
            participantId: user.Id,
          }}
          token={authToken}
        >
          <MeetingConsumer>
            {() => <MainGame isVideoChatAllowed={true} />}
          </MeetingConsumer>
        </MeetingProvider>
      )
    );
  }
};

export default MeetingProviderWrappedMainGame;
