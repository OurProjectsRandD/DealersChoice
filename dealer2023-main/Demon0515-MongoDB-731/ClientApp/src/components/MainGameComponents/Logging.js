import React, { useCallback } from "react";
import { capitalizeFirstLetter } from "../../common/game/basic";
import { useSelector } from "react-redux";
const Logging = () => {
  const gameState = useSelector((state) => state.gameState);

  return (
    <div className="d-none col-2 d-sm-block bg-black text-light my-top mx-auto">
      <div className="DivGameCode text-center mt-1" id="inviteCode">
        <span>
          Join code:&nbsp;
          {gameState.GameCode}
        </span>
      </div>

      <div className="CustomSideBar">
        {gameState.HandSteps.slice()
          .reverse()
          .map((handStep) => (
            <>
              {handStep.BettingRounds.slice()
                .reverse()
                .map((roundStep) => (
                  <>
                    {roundStep.AfterRoundSteps.slice()
                      .reverse()
                      .map((actionStep) => (
                        <>
                          <br />
                          <br />
                          {/* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#8594;&nbsp; */}
                          <span
                            className={`d-block log-entry ${
                              actionStep.Action === "Deal" ||
                              actionStep.Action === "ReturnToDeck" ||
                              actionStep.Action === "Discard"
                                ? "card-action"
                                : "player-action"
                            }`}
                          >
                            <strong>
                              {capitalizeFirstLetter(actionStep.PlayerName)}
                            </strong>
                            {" " + actionStep.Description.trim()}
                          </span>
                        </>
                      ))}
                    <br />
                    <br />
                    {/* &nbsp;&nbsp;&#8594;&nbsp; */}
                    <span className="d-block log-entry betting-round">
                      Betting Round: {roundStep.RoundId + 1}
                    </span>
                    {roundStep.BeforeRoundSteps.slice()
                      .reverse()
                      .map((actionStep) => (
                        <>
                          <br />
                          <br />
                          {/* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#8594;&nbsp; */}
                          <span
                            className={`d-block log-entry ${
                              actionStep.Action === "Deal" ||
                              actionStep.Action === "ReturnToDeck" ||
                              actionStep.Action === "Discard"
                                ? "card-action"
                                : "player-action"
                            }`}
                          >
                            <strong>
                              {capitalizeFirstLetter(actionStep.PlayerName)}
                            </strong>
                            {" " + actionStep.Description.trim()}
                          </span>
                        </>
                      ))}
                  </>
                ))}
              <br />
              <br />
              <span className="d-block log-entry new-hand">
                NEW HAND: {handStep.HandId + 1}
              </span>
            </>
          ))}
      </div>
    </div>
  );
};

export default Logging;
