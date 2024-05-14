import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReturnToDeck } from "../../common/game/GameControl";
import { returnToDeck } from "../../slice/gameStateSlice";
import { setSelectedCards } from "../../slice/cardSlice";

const ReturnToDeckButton = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const selectedCards = useSelector((state) => state.card.selectedCards);
  const user = useSelector((state) => state.auth.user);

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );

  const ReturnToDeckEventHandler = useCallback(
    (ev) => {
      ReturnToDeck(
        user.Id,
        gameState.GameCode,
        currentIndex,
        selectedCards,
        () => {
          dispatch(
            returnToDeck({
              selectedCards,
              Index: currentIndex,
            })
          );
          dispatch(setSelectedCards([]));
        }
      );
    },
    [currentIndex, dispatch, gameState, selectedCards, user.Id]
  );
  if (selectedCards.length === 0) return <></>;
  return (
    <button
      className="btn Discard ml-1 mt-1 mr-1"
      data-playersno="X"
      onClick={ReturnToDeckEventHandler}
    >
      Return To Deck
    </button>
  );
};

export default ReturnToDeckButton;
