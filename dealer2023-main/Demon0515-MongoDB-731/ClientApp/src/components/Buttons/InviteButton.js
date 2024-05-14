import React, { useCallback, useState } from "react";
import "../../css/MainGame.css";
import InviteModal from "../Dialogs/InviteModal";
import { useSelector } from "react-redux";
const InviteButton = () => {
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);
  const isAuthorized = useSelector((state) => state.auth.isAuthorized);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const clickEventHandler = useCallback(() => {
    setInviteModalOpen(true);
  }, []);

  //only creator show
  if (gameState.GameCreatorId === user.Id && isAuthorized) {
    return (
      <>
        <button className="btn BtnCancelHand m-2" onClick={clickEventHandler}>
          Invite
        </button>
        <InviteModal open={inviteModalOpen} setOpen={setInviteModalOpen} />
      </>
    );
  } else return <></>;
};

export default InviteButton;
