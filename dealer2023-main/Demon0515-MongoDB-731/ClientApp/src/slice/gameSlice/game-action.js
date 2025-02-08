import { actions } from "./game-slice";

export function setNewGameState(payload) {
  return async (dispatch) => {
    dispatch(actions.startLoading());
    console.log("state payload =====", payload);
    try {
      dispatch(actions.setState(payload));
    } catch (error) {
      console.log("errorr ===", error);
      dispatch(actions.hasError(error));
    }
  };
}
