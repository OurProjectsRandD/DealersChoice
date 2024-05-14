import React, { useCallback, useState } from "react";
import ChooseCommunityModal from "../Dialogs/ChooseCommunityModal";
import { useDispatch, useSelector } from "react-redux";
import { setDraggingCard } from "../../slice/cardSlice";
import { PassCards } from "../../common/game/GameControl";
import { passCard } from "../../slice/gameStateSlice";

const PotDiv = () => {
  const [chooseCommunityModalOpen, setChooseCommunityModalOpen] =
    useState(false);
  const [card, setCard] = useState({});
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const draggingCard = useSelector((state) => state.card.draggingCard);
  const user = useSelector((state) => state.auth.user);

  const CommunityCardEventHandler = useCallback((ev, obj) => {
    setCard({
      ...obj,
      Type: 1,
    });
    setChooseCommunityModalOpen(true);
  }, []);

  const DropToCommunity = useCallback(
    (ev, communityIndex) => {
      try {
        //alert($(DragSrc).data('cardvalue'));
        ev.preventDefault();
        // for now opening modal for community
      } catch (ex) {
        alert("drop at the right place!");
      }
      PassCards(
        user.Id,
        gameState.GameCode,
        [draggingCard],
        communityIndex,
        1,
        () => {
          dispatch(
            passCard({
              draggingCards: [draggingCard],
              Index: communityIndex,
              type: 1,
            })
          );
        }
      );
    },
    [dispatch, draggingCard, gameState.GameCode]
  );

  const AllowDropCommunity = useCallback((ev) => {
    ev.preventDefault();
  }, []);

  const DragEndCommunity = useCallback((ev) => {
    ev.preventDefault();
  }, []);

  const Drag = useCallback(
    (CommunityIndex, cardvalue, presentation) => {
      dispatch(
        setDraggingCard({
          Value: cardvalue,
          Presentation: presentation,
          Index: CommunityIndex,
          Type: 1,
        })
      );
    },
    [dispatch]
  );

  return (
    <>
      <div className="bg-light text-center">
        <div className="text-center mb-0 p-0" id="status">
          {gameState.BetStatus}
        </div>
      </div>
      <div className="text-center mx-auto p-3">
        <div className="PlayerNameX badge badge-warning mt-1">Pot</div>
        <span className="PlayerStatus badge badge-warning mx-auto ms-1">
          {gameState.PotSize}
        </span>
        {gameState.Deck.length !== 52 &&
          gameState.CommunityCards.length > 0 && (
            <div className="PlayerX mt-3 row">
              {Array.apply(null, Array(gameState.NumberOfCommunities)).map(
                (obj, index) => (
                  <div
                    style={{
                      paddingLeft: "0px",
                      paddingRight: "0px",
                      padding: "0px important!",
                      width: "20%",
                      color: "white",
                    }}
                    id={"CommunityIndex" + index}
                    key={index}
                  >
                    {index + 1} <br />
                    {gameState.CommunityCards.filter(
                      (x) => x.CommunityIndex === index
                    ).map((obj, index) => {
                      let cardimage = "";
                      if (obj.Value.length === 3) {
                        cardimage = obj.Value[2] + obj.Value[0] + obj.Value[1];
                      } else {
                        cardimage = obj.Value[1] + obj.Value[0];
                      }
                      cardimage =
                        obj.Presentation === 0 ? cardimage : "backside";
                      return (
                        <img
                          key={index}
                          alt=""
                          src={"/assets/Cards/" + cardimage + ".png"}
                          className="CommunityCard"
                          data-cardvalue={obj.Value}
                          data-presentation={obj.Presentation}
                          data-communityindex={index}
                          onDragStart={() =>
                            Drag(index, obj.Value, obj.Presentation)
                          }
                          onClick={(ev) => CommunityCardEventHandler(ev, obj)}
                        />
                      );
                    })}
                    <div
                      className="CommunityCardDrop"
                      data-cardvalue="-1"
                      data-presentation="public"
                      data-communityindex={index}
                      onDrop={(ev) => DropToCommunity(ev, index)}
                      draggable="false"
                      onDragOver={AllowDropCommunity}
                      onDragEnd={DragEndCommunity}
                      onDragLeave={DragEndCommunity}
                    >
                      +
                    </div>
                  </div>
                )
              )}
            </div>
          )}
      </div>
      <ChooseCommunityModal
        open={chooseCommunityModalOpen}
        setOpen={setChooseCommunityModalOpen}
        Card={card}
      />
    </>
  );
};

export default PotDiv;
