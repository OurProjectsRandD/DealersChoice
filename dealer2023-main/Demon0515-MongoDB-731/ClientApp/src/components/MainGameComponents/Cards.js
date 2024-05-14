import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDraggingCard, setSelectedCards } from "../../slice/cardSlice";

const Cards = ({ playerIndex, obj, isCurrent = false }) => {
  const dispatch = useDispatch();
  const selectedCards = useSelector((state) => state.card.selectedCards);
  const user = useSelector((state) => state.auth.user);
  const gameState = useSelector((state) => state.gameState);
  const getCardImage = useCallback((obj) => {
    return obj && obj.Value && obj.Value.length === 3
      ? obj.Value[2] + obj.Value[0] + obj.Value[1]
      : obj.Value[1] + obj.Value[0];
  }, []);

  const Drag = useCallback(
    (cardvalue, presentation) => {
      dispatch(
        setDraggingCard({
          Value: cardvalue,
          Presentation: presentation,
          Index: playerIndex,
          Type: 0,
        })
      );
    },
    [dispatch, playerIndex]
  );

  const isSelected = useMemo(
    () => selectedCards.filter((x) => x.Value === obj.Value).length > 0,
    [selectedCards, obj]
  );

  const toggleSelect = useCallback(() => {
    if (isSelected)
      dispatch(
        setSelectedCards(selectedCards.filter((x) => x.Value !== obj.Value))
      );
    else {
      dispatch(
        setSelectedCards([
          ...selectedCards,
          {
            Value: obj.Value,
            Presentation: obj.Presentation,
            Index: playerIndex,
            Type: 0,
          },
        ])
      );
    }
  }, [
    dispatch,
    isSelected,
    obj.Presentation,
    obj.Value,
    playerIndex,
    selectedCards,
  ]);

  const onClick = useCallback(
    (ev) => {
      if (isCurrent) toggleSelect();
    },
    [isCurrent, toggleSelect]
  );

  return (
    <img
      alt=""
      src={
        isCurrent || !obj.Presentation
          ? "/assets/Cards/" + getCardImage(obj) + ".png"
          : "/assets/Cards/backside.png"
      }
      onClick={onClick}
      className={"PlayerCard " + (isSelected ? "Selected" : "")}
      data-cardvalue={obj.Value}
      data-presentation={obj.Presentation}
      title={obj.Presentation}
      draggable={isCurrent}
      onDragStart={() => Drag(obj.Value, obj.Presentation)}
    />
  );
};

export default Cards;
