import React, { useState } from "react";
import PassCardModal from "../Dialogs/PassCardModal";
import { useSelector } from "react-redux";

const PassCardButton = () => {
  const [passCardModalOpen, setPassCardModalOpen] = useState(false);
  const selectedCards = useSelector((state) => state.card.selectedCards);
  if (selectedCards.length === 0) return <></>;
  return (
    <>
      <button
        className="btn btn PassCard"
        data-toggle="tooltip"
        data-html="true"
        title="..."
        onClick={() => setPassCardModalOpen(true)}
      >
        Pass Card
      </button>
      <PassCardModal open={passCardModalOpen} setOpen={setPassCardModalOpen} />
    </>
  );
};

export default PassCardButton;
