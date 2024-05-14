import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bet } from "../../common/game/GameControl";
import { bet } from "../../slice/gameStateSlice";

const BetButton = ({ BetTakeValueRef }) => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);

  const currentIndex = useMemo(
    () => gameState.ActivePlayers.findIndex((x) => x.PlayerId === user.Id),
    [gameState.ActivePlayers, user.Id]
  );

  const currentPlayer = useMemo(() => {
    if (currentIndex === -1) return {};
    return gameState.ActivePlayers[currentIndex];
  }, [currentIndex, gameState.ActivePlayers]);

  const BetEventHandler = useCallback(
    (ev) => {
      try {
        // you should input betammount
        if (BetTakeValueRef.current.value === "") {
          // eslint-disable-next-line no-undef
          alert("bet amount is required");
          return;
        }

        let betamount = parseInt(BetTakeValueRef.current.value);
        if (isNaN(betamount)) {
          alert("Input correct number");
          return;
        }
        betamount = parseFloat(betamount);

        // betamount must be more than currentBet amount - your current round status
        if (
          betamount <
          gameState.CurrentBet - currentPlayer.CurrentRoundStatus
        ) {
          // eslint-disable-next-line no-undef
          alert(
            "Minimum bet is:" +
              (gameState.CurrentBet - currentPlayer.CurrentRoundStatus)
          );
          return;
        }

        // if betamount is suitable.
        else {
          Bet(user.Id, gameState.GameCode, currentIndex, betamount, () => {
            dispatch(bet({ Index: currentIndex, Amount: betamount }));
          });
        }

        // init BetTakeValue
        BetTakeValueRef.current.value = "";
      } catch (err) {}
    },
    [BetTakeValueRef, currentIndex, currentPlayer, dispatch, gameState, user.Id]
  );

  if (gameState.CurrentId === user.Id && currentPlayer.PlayerCards.length > 0) {
    return (
      <button className="btn Bet mt-1" onClick={BetEventHandler}>
        &nbsp;Bet&nbsp;
      </button>
    );
  }
  return <></>;
};

export default BetButton;
