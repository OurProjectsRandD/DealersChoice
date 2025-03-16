import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ReturnToDeck } from "../../common/game/GameControl";
import { setSelectedCards } from "../../slice/cardSlice";
import { returnToDeckAction } from "../../slice";

const ReturnToDeckButton = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.newGameState);
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
            returnToDeckAction({
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
      className="btn Discard mt-1 me-1 me-md-0"
      data-playersno="X"
      onClick={ReturnToDeckEventHandler}
    >
      Return To Deck
    </button>
  );
};

export default ReturnToDeckButton;
