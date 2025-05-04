import React, { useCallback, useMemo, useRef, useState } from "react";
import AnteButton from "../Buttons/AnteButton";
import PassCommunityModal from "../Dialogs/PassCommunityModal";
import PassDealPopUp from "../Dialogs/PassDealPopup";
import {
  DealCards,
  getActiveGameParticipants,
} from "../../common/game/GameControl";
import { useDispatch, useSelector } from "react-redux";

const DealerPanel = () => {
  const [cardDealType, setCardDealType] = useState(0);
  const [passCommunityModalOpen, setPassCommunityModalOpen] = useState(false);
  const [passDealPopUpOpen, setPassDealPopUpOpen] = useState(false);
  // const [participants, setParticipants] = useState([]);
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.newGameState);
  const user = useSelector((state) => state.auth.user);
  console.log("gameState", gameState.ActivePlayers);
  const txtAnteRef = useRef(null);
  const DealValueRef = useRef(null);

  const activePlayers = gameState.ActiveParticipants.filter(
    (activePlayer) =>
      activePlayer.IsFolded === false && activePlayer.IsDisconnected === false
  );

  const participants = useMemo(async () => {
    const players = await getActiveGameParticipants(gameState.GameCode);

    if (!players) {
      return [];
    }

    return;
  }, []);

  //when you click deal button
  const dealCardToPlayer = useCallback(
    (index) => {
      try {
        console.log("Filtered Active Players:", activePlayers);
        console.log("Index of player to deal card to:", index);
        console.log("Deal Value Ref:", DealValueRef.current.value);
        console.log("Card Deal Type:", cardDealType);
        // Get Number of card to pass
        const NumOfCard = parseInt(DealValueRef.current.value);

        if (isNaN(NumOfCard)) {
          alert("Input correct number");
          return;
        }

        if (NumOfCard <= 0) {
          alert("Cannot deal zero or less cards");
          return;
        }

        DealCards(
          user.Id,
          gameState.GameCode,
          DealValueRef.current.value,
          index,
          0,
          cardDealType,
          () => {
            setPassCommunityModalOpen(false);
            // DealValueRef.current.value = "";
            DealValueRef.current.value = null;
          }
        );
      } catch (err) {
        console.log("error dealing card to player = ", err);
      }
    },
    [activePlayers, cardDealType, gameState.GameCode, user.Id]
  );

  const daelCardToCommunity = useCallback(
    (communityIndex) => {
      try {
        DealCards(
          user.Id,
          gameState.GameCode,
          DealValueRef.current.value,
          communityIndex,
          1,
          cardDealType,
          () => {
            setPassCommunityModalOpen(false);
          }
        );
      } catch (err) {
        console.log("error dealing card to community = ", err);
      }
    },
    [cardDealType, gameState.GameCode, user.Id]
  );

  const PassDealEventHandler = useCallback((ev) => {
    setPassDealPopUpOpen(true);
  }, []);

  return (
    <>
      <div className="PlayerDealer">
        <div className="row align-items-center border-primary border-bottom mb-1 justify-content-between p-3 p-sm-0">
          <div className="col-2 col-sm-2 text-center  h-100">
            <input
              id="txtAnte"
              className="mt-0"
              ref={txtAnteRef}
              autoComplete="off"
            />
            <AnteButton txtAnteRef={txtAnteRef} />
          </div>
          <div className="col-5 col-sm-3 text-center  h-100">
            <span>Deal</span>
            <input
              id="DealValue"
              className="p-0"
              ref={DealValueRef}
              autoComplete="off"
              inputMode="numeric"
            />
            <span>Cards</span>
          </div>
          <div className="col-5 col-sm-3 text-center  h-100">
            <div>
              <input
                autoComplete="off"
                type="radio"
                className="w-25 d-inline"
                id="faceup"
                value="public"
                name="CardDealType"
                defaultChecked
                onClick={() => setCardDealType(0)}
              />
              <label htmlFor="faceup" className="w-50 btn btn">
                up
              </label>
            </div>
            <div className="d-inline-block; mt-2">
              <input
                autoComplete="off"
                type="radio"
                className="w-25 d-inline"
                id="facedown"
                value="private"
                name="CardDealType"
                onClick={() => setCardDealType(1)}
              />
              <label htmlFor="facedown" className="w-50 btn btn">
                down
              </label>
            </div>
          </div>
          <div className="col-2 col-sm-1 text-center  h-100">to</div>
          <div className="col-8 col-sm-3 text-center  h-100">
            <div
              className="CardDealPlayer"
              style={{
                display: "inline-grid",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              <label
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => dealCardToPlayer(-1)}
              >
                All
              </label>
              <label
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => setPassCommunityModalOpen(true)}
              >
                Community
              </label>
              {activePlayers.map((activePlayer, index) => {
                console.log(
                  "activePlayer on map and index",
                  activePlayer,
                  index
                );
                const handleClick = () => dealCardToPlayer(index);
                return (
                  <label
                    key={index}
                    style={{
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                    onClick={handleClick}
                  >
                    {activePlayer.PlayerName}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div className=" p-2">
          <div className=" text-center">
            <button
              className="btn btn PassDeal m2"
              data-toggle="tooltip"
              data-html="true"
              title="click to view options"
              onClick={PassDealEventHandler}
            >
              Pass Deal
            </button>
          </div>
        </div>
      </div>
      <PassCommunityModal
        open={passCommunityModalOpen}
        setOpen={setPassCommunityModalOpen}
        dealCardToCommunity={daelCardToCommunity}
      />
      <PassDealPopUp open={passDealPopUpOpen} setOpen={setPassDealPopUpOpen} />
    </>
  );
};

export default DealerPanel;
