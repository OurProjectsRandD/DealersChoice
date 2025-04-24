import React, { useEffect, useState, useRef, useCallback } from "react";
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
  decreaseVideoMinutes,
  startConnectionWithGameCodeAndUserId,
  decreaseVideoMinutesRuntime,
} from "../../common/game/GameControl";
import SettlementModalEndGame from "../../components/Dialogs/SettlementModalEndGame";
import { setMeetingJoined, setVideoTime } from "../../slice/authSlice";
import { SettlementEndGame } from "../../components/Settlements/SettlementEndGame";
import {
  addToPotAction,
  anteAction,
  betAction,
  callAction,
  cancelHandAction,
  checkAction,
  dealCardsAction,
  discardAction,
  endGameAction,
  endHandAction,
  findPlayerLeftIndex,
  foldAction,
  passCardAction,
  passDealAction,
  playerConnectedAction,
  playerDisconnectedAction,
  playerJoinGameAction,
  rejoinAction,
  returnToDeckAction,
  setNewGameState,
  showAction,
  sitOutAction,
  takeAction,
} from "../../slice";

const MainGame = ({ isVideoChatAllowed = false }) => {
  const stateRef = useRef();
  const navigator = useNavigate();
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

  const { isLoading, ...gameState } = useSelector(
    (state) => state.newGameState
  );

  const dispatch = useDispatch();
  const GameCode = searchParams.get("GameCode");
  const [connection, setConnection] = useState({});

  const preventrefresh = (e) => {
    e.preventDefault();
    e.returnValue = "data will get lost";
    return e.returnValue;
  };

  useEffect(() => {
    document.body.classList.remove("public");
    window.addEventListener("beforeunload", preventrefresh);

    return () => {
      document.body.classList.add("public");
      window.removeEventListener("beforeunload", preventrefresh);
    };
  }, []);

  //InitiateConnection to signal R
  const initiateConnection = useCallback(async () => {
    if (!GameCode || !user?.Id) return null;

    try {
      const connection = await startConnectionWithGameCodeAndUserId(
        GameCode,
        user.Id
      );
      LogRocket.log("Connected to SignalR", connection.connectionId);
      setConnection(connection);

      SendRequest({
        method: "POST",
        url: "Game/JoinGame",
        data: {
          GameCode: GameCode,
          UserId: user.Id,
          DisplayName: user.NickName,
          ConnectionId: connection.connectionId,
        },
      }).then((result) => {
        if (result.data === null || result.data === "") {
          alert(
            "Can't join game because of wrong game code, game is locked or didn't get invite"
          );
          navigator("/");
          return;
        }
        dispatch(setNewGameState(result.data));
        LogRocket.log("Joined Game", result.data);
      });
    } catch (error) {
      console.log("Error initiating connection");
    }
  }, [GameCode, navigator, user.Id, user.NickName, dispatch]);

  useEffect(() => {
    initiateConnection();
  }, [initiateConnection]);

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
            `Active Players: ${stateRef.current.minutes} stateRef.current.minutes +${stateRef.current.gameHash.ActivePlayers.length} stateRef.current.gameHash.ActivePlayers.length`
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
    // console.log("Dealer: ", gameState.DealerId);
    // console.log("Active Players:", JSON.stringify(stateRef.current.gameHash, null, 2));

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
        playerConnectedAction({
          UserId,
          ConnectionId,
          gameState: { ...gameState },
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
          playerJoinGameAction({
            userId,
            playerImage,
            userName,
            connectionId,
            gameState: { ...gameState },
          })
        );
      }
    );

    connection.on("PassCard", (draggingCards, currentIndex, type) => {
      dispatch(
        passCardAction({
          gameState: { ...gameState },
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
      dispatch(findPlayerLeftIndex({ index, gameState: { ...gameState } }));
    });

    connection.on("Kicked_Out", () => {
      alert("You have been kicked");
      navigator("/");
    });

    connection.on("Player_Disconnected", (index) => {
      alert("Player_Disconnected");
      dispatch(
        playerDisconnectedAction({ index, gamseState: { ...gameState } })
      );
      console.log("player_Disconected vvv" + index + gameState);
    });

    connection.on("Bet", (index, amount) => {
      dispatch(
        betAction({
          gamseState: { ...gameState },
          Amount: amount,
          Index: index,
        })
      );
    });

    connection.on("Take", (index, amount) => {
      dispatch(
        takeAction({
          gamseState: { ...gameState },
          Amount: amount,
          Index: index,
        })
      );
    });

    connection.on("Call", (index) => {
      dispatch(callAction(index));
    });

    connection.on("AddToPot", (index, amount) => {
      dispatch(
        addToPotAction({
          Index: index,
          Amount: amount,
        })
      );
    });

    connection.on("Ante", (index, amount) => {
      dispatch(
        anteAction({
          Index: index,
          Amount: amount,
        })
      );
    });

    connection.on("Cancel_Hand", () => {
      dispatch(cancelHandAction());
    });

    connection.on("Check", (index) => {
      dispatch(checkAction(index));
    });

    connection.on("Discard", (draggingCards, index) => {
      dispatch(
        discardAction({
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
        returnToDeckAction({
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
        showAction({
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
      dispatch(endHandAction(index));
    });

    connection.on("Fold", (index) => {
      dispatch(foldAction(index));
    });

    connection.on("Sitout", (index) => {
      dispatch(sitOutAction(index));
    });

    connection.on("Rejoin", (index) => {
      dispatch(rejoinAction(index));
    });

    connection.on("Endgame", (index) => {
      dispatch(endGameAction(index));
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
        dealCardsAction({
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
      dispatch(passDealAction(dealerId));
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

  // Get active players from gameState
  const activePlayers = stateRef.current.gameHash.ActivePlayers.map(
    (player, index) => {
      const ptrValue = index + 2; // Assign ptr dynamically (starts from 2)
      return { ...player, ptr: ptrValue };
    }
  );

  const totalPlayers = activePlayers.length;
  // console.log("total players =====", totalPlayers);

  if (!isLoading)
    return (
      <>
        <div className="container-fluid bg-black p-0" id="GameBoard">
          <div className="row">
            <div className="col-lg-2 mb-3">
              {/* Hamburger Menu Toggle Button for Mobile */}
              <div class="d-lg-none mb-2">
                <button
                  class="btn btn-primary ms-auto d-block"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mobileSidebar"
                  aria-expanded="false"
                  aria-controls="mobileSidebar"
                >
                  <i class="bi bi-list"></i>
                </button>
              </div>
              <div class="collapse d-lg-block" id="mobileSidebar">
                <div
                  // remove inline style
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "20px",
                  }}
                >
                  <div
                    // remove inline style
                    style={{
                      // height: "450px",
                      overflow: "auto",
                      width: "100%",
                    }}
                  >
                    <Logging />
                  </div>

                  <SettlementEndGame
                    isShow={false}
                    gameState={gameState}
                    open={settlementModalEndGameOpen}
                    setOpen={setSettlementModalEndGameOpen}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-10">
              <div className="row">
                <div
                  className="logging d-none col-12 alert alert-warning"
                  id="logging"
                >
                  <span>Game Started</span>
                </div>
              </div>

              <div id="table">
                <div className="row">
                  <div
                    className="order-1 order-sm-0 col-6 col-md-3 col-lg-2 mt-2 mt-md-1 mt-lg-0 seat"
                    data-dealer="2"
                  >
                    <Player ptr={2} dealerId={gameState.DealerId} />
                  </div>
                  <div
                    className="order-2 order-sm-0 col-6 col-md-3 col-lg-2 mt-2 mt-md-1 mt-lg-0 seat"
                    data-dealer="3"
                  >
                    <Player ptr={3} dealerId={gameState.DealerId} />
                  </div>
                  <div className="order-0 order-sm-0 col-12 col-sm-6 col-md-3 col-lg-2 mt-2 mt-md-1 mt-lg-0 seat">
                    <div id="potdiv">
                      <PotDiv />
                    </div>
                  </div>
                  <div
                    className="order-3 col-6 col-md-3 col-lg-2 mt-2 mt-md-1 mt-lg-0 seat"
                    data-dealer="4"
                  >
                    <Player ptr={4} dealerId={gameState.DealerId} />
                  </div>
                  <div
                    className="order-4 col-6 col-md-3 col-lg-2 mt-2 mt-md-1 mt-lg-0 seat"
                    data-dealer="5"
                  >
                    <Player ptr={5} dealerId={gameState.DealerId} />
                  </div>
                  <div
                    className="order-5 col-6 col-md-3 col-lg-2 mt-2 mt-md-1 mt-lg-0 seat"
                    data-dealer="6"
                  >
                    <Player ptr={6} dealerId={gameState.DealerId} />
                  </div>
                  {/* {activePlayers.slice(0, middleIndex).map((player, index) => (
                    <div key={player.PlayerId} className={`order-1 order-sm-${index} col-6 col-md-3 col-lg-2 mt-2 mt-md-1 mt-lg-0 seat`} data-ptr={player.ptr}>
                      <Player ptr={player.ptr} dealerId={gameState.DealerId} />
                    </div>
                  ))} */}

                  {/* POT DIV - Always in Middle */}
                  {/* <div className={`order-0 order-sm-${middleIndex} col-12 col-sm-6 col-md-3 col-lg-2 mt-2 mt-md-1 mt-lg-0 seat`}>
                    <div id="potdiv">
                      <PotDiv />
                    </div>
                  </div>

                  {activePlayers.slice(middleIndex).map((player, index) => (
                    <div key={player.PlayerId} className={`order-${middleIndex + index + 1} col-6 col-md-3 col-lg-2 mt-2 mt-md-1 mt-lg-0 seat`} data-ptr={player.ptr}>
                      <Player ptr={player.ptr} dealerId={gameState.DealerId} />
                    </div>
                  ))} */}
                </div>
                <div className="row mt-3">
                  <div className="col-12 col-md-12">
                    <CurrentPlayerDiv gameState={gameState} />
                  </div>
                  {/* <div className="col-12 col-md-2">
                    <DefaultPlayer ptr={1} />
                  </div> */}
                </div>
              </div>
              <div className="player-deal-card my-3 overflow-hidden">
                {gameState.DealerId === user.Id && <DealerPanel />}
              </div>
              <GameControlPanel isMeetingJoined={isMeetingJoined} />
            </div>
          </div>
        </div>
        <VideoMinutesRunOutNotification
          open={videoMinutesRunoutModalOpen}
          setOpen={setVideoMinutesRunoutModalOpen}
        />
        <ToastContainer />
        {/* <SettlementModalEndGame
          isShow={false}
          gameState={gameState}
          open={settlementModalEndGameOpen}
          setOpen={setSettlementModalEndGameOpen}
        /> */}
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
