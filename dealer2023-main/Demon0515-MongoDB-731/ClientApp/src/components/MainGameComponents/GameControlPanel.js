import React from "react";
import LockGameButton from "../Buttons/LockGameButton";
import CancelHandButton from "../Buttons/CancelHandButton";
import EndHandButton from "../Buttons/EndHandButton";
import LeaveButton from "../Buttons/LeaveButton";
import GameOverButton from "../Buttons/GameOverButton";
import SitOutButton from "../Buttons/SitoutButton";
import InviteButton from "../Buttons/InviteButton";
import TakePictureButton from "../Buttons/TakePictureButton";
import ToggleCameraButton from "../Buttons/ToggleCameraButton";
import { useSelector } from "react-redux";
import StartVideo from "../Buttons/StartVideoButton";

const GameControlPanel = ({ isMeetingJoined }) => {
  const gameState = useSelector((state) => state.gameState);

  return (
    <>
      <div className="row">
        <div className="col-10 text-center">
          {!(gameState.PotSize === 0 && gameState.Deck.length === 52) && (
            <>
              <CancelHandButton />
              <EndHandButton />
            </>
          )}
          <GameOverButton />
          <LeaveButton />
          <SitOutButton />
          <LockGameButton />
          {<InviteButton />}
          {gameState.VideoChatAllowed && <StartVideo />}
        </div>
        <div className="col-2 text-center">
          <div className="row">
            <TakePictureButton />
          </div>
          <div className="row mt-2">
            {gameState.MeetingId !== null && <ToggleCameraButton />}
          </div>
        </div>
      </div>
    </>
  );
};

export default GameControlPanel;
