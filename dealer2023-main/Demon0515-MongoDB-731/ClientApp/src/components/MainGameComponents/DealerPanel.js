import React, { useCallback, useRef, useState } from "react";
import AnteButton from "../Buttons/AnteButton";
import PassCommunityModal from "../Dialogs/PassCommunityModal";
import PassDealPopUp from "../Dialogs/PassDealPopup";
import { DealCards } from "../../common/game/GameControl";
import { useDispatch, useSelector } from "react-redux";

const DealerPanel = () => {
  const [cardDealType, setCardDealType] = useState(0);
  const [passCommunityModalOpen, setPassCommunityModalOpen] = useState(false);
  const [passDealPopUpOpen, setPassDealPopUpOpen] = useState(false);
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);

  const txtAnteRef = useRef(null);
  const DealValueRef = useRef(null);

  //when you click deal button
  const dealCardToPlayer = useCallback(
    (index) => {
      try {
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
            DealValueRef.current.value = "";
          }
        );
      } catch (err) {}
    },
    [cardDealType, gameState.GameCode, user.Id]
  );

  const daelCardToCommunity = useCallback(
    (communityIndex) => {
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
    },
    [cardDealType, gameState.GameCode, user.Id]
  );

  const PassDealEventHandler = useCallback((ev) => {
    setPassDealPopUpOpen(true);
  }, []);

  return (
    <>
      <div className="PlayerDealer m-1 pt-1">
        <div className="row align-items-center border-primary border-bottom mb-1 justify-content-between h-75">
          <div className="col-auto text-center p-0 mr-3 h-100">
            <input
              id="txtAnte"
              className="mt-0"
              ref={txtAnteRef}
              autoComplete="off"
            />
            <AnteButton txtAnteRef={txtAnteRef} />
          </div>
          <div className="col-auto p-0 text-left h-100">
            <span>Deal</span>
            <input
              id="DealValue"
              className="p-0"
              ref={DealValueRef}
              autoComplete="off"
            />
            <span>Cards</span>
          </div>
          <div className="col-2 p-0 m-3 text-left h-100">
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
            <div className="d-inline-block; mt-3">
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
          <div className="col-auto p-2 h-100">to</div>
          <div className="col-auto pr-0 text-left h-100">
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
              {gameState.ActivePlayers.filter(
                (activePlayer) =>
                  activePlayer.IsFolded === false &&
                  activePlayer.IsDisconnected === false
              ).map((activePlayer, index) => {
                return (
                  <label
                    key={index}
                    style={{
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                    onClick={() => dealCardToPlayer(index)}
                  >
                    {activePlayer.PlayerName}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div className="row m1-1">
          <div className="col-12 text-center">
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
