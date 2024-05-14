import React, { useCallback, useState } from "react";
import NotificationModal from "./NotificationModal";
import PurchasingVideoMinutesModal from "./PurchasingVideoMinutesModal";
import PurchasingTokensModal from "./PurchasingTokensModal";
import { useMeeting } from "@videosdk.live/react-sdk";
import {
  EndVideoMeeting,
  decreaseVideoMinutes,
} from "../../common/game/GameControl";
import { useDispatch, useSelector } from "react-redux";
import { buyTokens } from "../../slice/authSlice";

const VideoMinutesRunOutNotification = ({ open, setOpen }) => {
  const meetingAPI = useMeeting();
  const gameState = useSelector((state) => state.gameState);
  const user = useSelector((state) => state.auth.user);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const dispatch = useDispatch();

  const purchaseTokenFeedback = useCallback(async (result, tokenValue) => {
    if (result.data === true) {
      alert("Successfully Purchased!");
      dispatch(buyTokens(tokenValue));
    }
  }, []);

  const handleOK = useCallback(() => {
    setPurchaseModalOpen(true);
    setOpen(false);
  }, [setOpen]);

  const handleCancel = useCallback(() => {
    EndVideoMeeting(user.Id, gameState.GameCode, () => {
      meetingAPI.end();
    });
  }, [gameState.GameCode, user.Id]);

  return (
    <>
      <NotificationModal
        open={open}
        setOpen={setOpen}
        NotificationMessage="You have 10 minutes left. Do you want to purchase more?"
        CancelButtonText="End Meeting"
        OkButtonText="Purchase more"
        handleOK={handleOK}
        handleCancel={handleCancel}
      />
      <PurchasingTokensModal
        open={purchaseModalOpen}
        setOpen={setPurchaseModalOpen}
        purchaseFeedBack={purchaseTokenFeedback}
      />
    </>
  );
};

export default VideoMinutesRunOutNotification;
