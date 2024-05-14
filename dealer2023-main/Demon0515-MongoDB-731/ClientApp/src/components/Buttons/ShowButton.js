import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Show } from "../../common/game/GameControl";
import { show } from "../../slice/gameStateSlice";
import { setSelectedCards } from "../../slice/cardSlice";
const ShowButton = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
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

  const ShowAllEventHandler = useCallback(
    (ev) => {
      Show(user.Id, gameState.GameCode, currentIndex, selectedCards, 0, () => {
        dispatch(
          show({
            Index: currentIndex,
            selectedCards: selectedCards,
          })
        );
        dispatch(setSelectedCards([]));
      });
    },
    [currentIndex, dispatch, gameState, selectedCards, user.Id]
  );

  if (
    currentPlayer &&
    currentPlayer.PlayerCards &&
    currentPlayer.PlayerCards.length === 0
  )
    return <></>;
  return (
    <button
      className="btn ShowAll ml-1 mt-1 mr-1"
      onClick={ShowAllEventHandler}
    >
      Show
    </button>
  );
};

export default ShowButton;
