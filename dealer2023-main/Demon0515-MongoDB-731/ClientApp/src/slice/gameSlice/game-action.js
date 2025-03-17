import LogRocket from "logrocket";
import { actions } from "./game-slice";

export function setNewGameState(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());
    try {
      dispatch(actions.setState(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function findPlayerLeftIndex(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());
    try {
      dispatch(actions.playerLeft(payload));
      LogRocket.log(`${payload}th Player Left Game`, payload.gameState);
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function playerConnectedAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());
    try {
      dispatch(actions.playerConnected(payload));
      LogRocket.log(`${payload.UserId} Connected`, payload.gameState);
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function playerJoinGameAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());
    try {
      dispatch(actions.playerJoinGame(payload));
      LogRocket.log(
        `${payload.userName} Joined joined the game`,
        payload.gameState
      );
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function passCardAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());
    try {
      dispatch(actions.passCard(payload));
      LogRocket.log(
        `Pass ${payload.draggingCards.length} cards to ${payload.Index}th ${
          payload.Type === 0 ? "Player" : "Community"
        }`,
        payload.gameState
      );
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function playerDisconnectedAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());
    try {
      dispatch(actions.playerDisconnected(payload));
      LogRocket.log(`${payload}th Player Disconnected`, payload.gameState);
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function betAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());
    try {
      dispatch(actions.bet(payload));
      LogRocket.log(
        `${payload.Index}th Player betted ${payload.Amount}`,
        payload.gameState
      );
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function takeAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());
    try {
      dispatch(actions.take(payload));
      LogRocket.log(
        `${payload.Index}th Player took $${payload.Amount}`,
        payload.gameState
      );
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function discardAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.discard(payload));
      LogRocket.log(
        `${payload.Index}th Player discarded ${payload.selectedCards.length} cards`,
        payload.gameState
      );
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function returnToDeckAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.returnToDeck(payload));
      LogRocket.log(
        `${payload.Index}th Player returned ${payload.selectedCards.length} cards to deck`,
        payload.gameState
      );
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function showAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.show(payload));
      LogRocket.log(
        `${payload.Index}th Player showed cards`,
        payload.gameState
      );
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function callAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.call(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function addToPotAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.addToPot(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function anteAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.ante(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function cancelHandAction() {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.cancelHand());
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function checkAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.check(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function endHandAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.endHand(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function foldAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.fold(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function sitOutAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.sitout(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function rejoinAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.rejoin(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function endGameAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.endGame(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function dealCardsAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.dealCard(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function passDealAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.passDeal(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function playerLeftAction(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.playerLeft(payload));
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}

export function toggleLockAction() {
  return async (dispatch) => {
    dispatch(actions.startLoading());

    try {
      dispatch(actions.toggleLock());
    } catch (error) {
      dispatch(actions.hasError(error));
    }
  };
}
