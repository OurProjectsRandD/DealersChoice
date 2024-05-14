import React, { useCallback, useMemo, useRef } from "react";
import Cards from "./Cards";
import $ from "jquery";
import PassCardButton from "../Buttons/PassCardButton";
import BetButton from "../Buttons/BetButton";
import CheckButton from "../Buttons/CheckButton";
import CallButton from "../Buttons/CallButton";
import FoldButton from "../Buttons/FoldButton";
import ShowButton from "../Buttons/ShowButton";
import TakeButton from "../Buttons/TakeButton";
import AddToPotButton from "../Buttons/AddToPotButton";
import DiscardButton from "../Buttons/DiscardButton";
import ReturnToDeckButton from "../Buttons/ReturnToDeckButton";
import { useDispatch, useSelector } from "react-redux";
import { PassCards } from "../../common/game/GameControl";
import { passCard } from "../../slice/gameStateSlice";
import DefaultPlayer from "../../components/MainGameComponents/DefaultPlayer";
const CurrentPlayerDiv = () => {
  //const [CardActionsVisible, setCardActionsVisible] = useState(true);
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const draggingCard = useSelector((state) => state.card.draggingCard);
  const selectedCards = useSelector((state) => state.card.selectedCards);
  const user = useSelector((state) => state.auth.user);

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );

  const currentPlayer = useMemo(() => {
    if (currentIndex === -1) return {};
    return gameState.ActivePlayers[currentIndex];
  }, [currentIndex, gameState.ActivePlayers]);

  const BetTakeValueRef = useRef(null);

  const AllowDrop = useCallback((ev) => {
    $(".fas").addClass("Droppable");
    ev.preventDefault();
  }, []);

  const DragEnd = useCallback((ev) => {
    $(ev.target).removeClass("Droppable");
    ev.preventDefault();
  }, []);

  const DropSelf = useCallback(
    (ev) => {
      try {
        $(".fas").removeClass("Droppable");
        ev.preventDefault();
      } catch (ex) {
        alert("drop at the right place!");
      }
      if (draggingCard.Index === currentIndex && draggingCard.Type === 0)
        return;
      PassCards(
        user.Id,
        gameState.GameCode,
        [draggingCard],
        currentIndex,
        0,
        () => {
          dispatch(
            passCard({
              draggingCards: [draggingCard],
              Index: currentIndex,
              Type: 0,
            })
          );
        }
      );
    },
    [currentIndex, dispatch, draggingCard, gameState.GameCode]
  );

  const DragEnter = useCallback((ev) => {
    ev.preventDefault();
  }, []);

  /* 
  useEffect(() => {
    try {
      disableWebcam();
      muteMic();
      join();
    } catch (e) {
      console.log("join error", e);
    }
  }, [disableWebcam, join, muteMic]); */

  return (
    <>
      <div
        id="currentPlayer"
        className="text-center mx-auto col-12 text-center card p-2 bg-dark"
        style={
          currentIndex === gameState.BetStatusIndex
            ? {
                zIndex: 50,
                border: "3px solid red !important",
                backgroundColor: "#ffff006e",
              }
            : {
                zIndex: 50,
              }
        }
      >
        <div className="item show">
          <div>
            <div
              className={
                "PlayerView PlayerActive Player1 Player " +
                (currentPlayer.IsFolded || currentPlayer.IsDisconnected
                  ? " PlayerFolded"
                  : "") +
                (gameState.CurrentId === user.Id && gameState.Deck.length < 52
                  ? " bg-active"
                  : "")
              }
            >
              <div
                className="pt-2"
                onDrop={DropSelf}
                onDragOver={AllowDrop}
                onDragEnter={DragEnter}
                onDragEnd={DragEnd}
                onDragLeave={DragEnd}
              >
                <span className="PlayerStatus badge badge-info p-2">
                  {currentPlayer && currentPlayer.PlayerAmount}
                </span>
                <span
                  className="PlayerName p-2"
                  // onInput={handleInputPlayerName}
                >
                  {currentPlayer && currentPlayer.PlayerName}
                </span>
                <div className="PlayerDeck row">
                  {currentPlayer &&
                    currentPlayer.PlayerCards &&
                    currentPlayer.PlayerCards.map((obj, index) => (
                      <Cards
                        key={obj.Value}
                        playerIndex={currentIndex}
                        obj={obj}
                        isCurrent={true}
                      />
                    ))}
                </div>

                <span className="PlayerAction badge badge-primary mx-auto">
                  {currentPlayer.LastActionPerformed}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <PassCardButton />
        </div>
        <div className="row PlayerActions bg-dark p-3 m-0">
          <div className="col-12 d-flex justify-content-around">
            <input
              autoComplete="off"
              type="text"
              id="BetTakeValue"
              className="ml-1"
              ref={BetTakeValueRef}
            />
            <BetButton BetTakeValueRef={BetTakeValueRef} />
            <CheckButton />
            <CallButton />
            <FoldButton />
            <div className="PlayerStatusNet ml-2">
              {currentPlayer.PlayerAmount + currentPlayer.PlayerNetStatusFinal}
            </div>
            <ShowButton />
            <AddToPotButton BetTakeValueRef={BetTakeValueRef} />
            {/* {selectedCards.length === 0 && (
              <>
                <TakeButton BetTakeValueRef={BetTakeValueRef} />
              </>
            )} */}
            <TakeButton BetTakeValueRef={BetTakeValueRef} />
            <DiscardButton />
            <ReturnToDeckButton />
          </div>
        </div>
      </div>
    </>
  );
};

export default CurrentPlayerDiv;
