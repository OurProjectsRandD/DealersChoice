import React, { useCallback, useState } from "react";
import ModalInfoCancelHandPrompt from "../Dialogs/ModalInfoCancelHandPrompt";
import ModalInfoCancelHand from "../Dialogs/ModalInfoCancelHand";
import { useDispatch, useSelector } from "react-redux";
import { CancelHand } from "../../common/game/GameControl";
import { cancelHand } from "../../slice/gameStateSlice";

const CancelHandButton = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);

  const [modalInfoCancelHandPromptOpen, setModalInfoCancelHandPromptOpen] =
    useState(false);

  const [modalInfoCancelHandOpen, setModalInfoCancelHandOpen] = useState(false);

  const CancelEventHandler = useCallback(
    (ev) => setModalInfoCancelHandPromptOpen(true),
    []
  );

  const ModalInfoCancelHandPrompt_Yes = useCallback(() => {
    setModalInfoCancelHandPromptOpen(false);
    CancelHand(user.Id, gameState.GameCode, () => {
      dispatch(cancelHand());
    });
  }, [dispatch, gameState, user]);

  return (
    gameState.DealerId === user.Id && (
      <>
        <button className="btn BtnCancelHand m-2" onClick={CancelEventHandler}>
          Cancel Hand
        </button>
        <ModalInfoCancelHandPrompt
          open={modalInfoCancelHandPromptOpen}
          setOpen={setModalInfoCancelHandPromptOpen}
          handleOK={ModalInfoCancelHandPrompt_Yes}
        />

        <ModalInfoCancelHand
          open={modalInfoCancelHandOpen}
          setOpen={setModalInfoCancelHandOpen}
        />
      </>
    )
  );
};

export default CancelHandButton;
