import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";
import { Discard } from "../../common/game/GameControl";
import { setSelectedCards } from "../../slice/cardSlice";
import { discardAction } from "../../slice";

const DiscardButton = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.newGameState);
  const selectedCards = useSelector((state) => state.card.selectedCards);
  const user = useSelector((state) => state.auth.user);

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );

  const DiscardEventHandler = useCallback(() => {
    Discard(user.Id, gameState.GameCode, currentIndex, selectedCards, () => {
      dispatch(
        discardAction({
          selectedCards,
          Index: currentIndex,
        })
      );
      dispatch(setSelectedCards([]));
    });
  }, [currentIndex, dispatch, gameState, selectedCards, user.Id]);

  //cards are selected
  if (selectedCards.length > 0) {
    return (
      <button
        className="btn Discard mt-1 me-1 me-md-0"
        onClick={DiscardEventHandler}
      >
        Discard
      </button>
    );
  } else return <></>;
};

export default DiscardButton;
