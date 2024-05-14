import React, { useCallback, useState } from "react";
import TakePictureOptionModal from "../Dialogs/TakePictureOptionModal";

const TakePictureButton = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const handleClick = useCallback(() => {
    setModalOpen(true);
  }, []);
  return (
    <>
      <button
        className="btn ml-1 mt-1 stencil"
        style={{ color: "white" }}
        onClick={handleClick}
      >
        <i className="bi bi-camera h4"></i>
      </button>
      <TakePictureOptionModal open={modalOpen} setOpen={setModalOpen} />
    </>
  );
};

export default TakePictureButton;
