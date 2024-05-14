import React, { useRef, useCallback, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";

const JoinGame = () => {
  const navigator = useNavigate();
  const user = useMemo(() => {
    let tUser = JSON.parse(localStorage.getItem("user"));
    if (tUser === null || tUser === undefined) {
      tUser = {
        Id: uuid(),
        DisplayName: null,
        isTemp: true,
      };
    }
    return tUser;
  }, []);

  const user_name_ref = useRef(null);
  const game_code_ref = useRef(null);

  const JoinGame = useCallback(() => {
    let tUser = { ...user };
    if (
      tUser.DisplayName === null &&
      user_name_ref.current.value.trim(" ").length === 0
    ) {
      alert("Input User Name or Login");
      return;
    } else if (game_code_ref === null) {
      alert("Input Game Code");
      return;
    }

    if (tUser.DisplayName === null) {
      tUser.DisplayName = user_name_ref.current.value;
      localStorage.setItem("user", JSON.stringify(tUser));
    }

    navigator("/game/main-game?GameCode=" + game_code_ref.current.value);
  }, [user]);

  return (
    <div className="row">
      <div className="col-md-12 p -2 MainPageDivs">
        <h2>Join Game</h2>
        {user.DisplayName === null && (
          <div className="form-group">
            <label htmlFor="UserName">User Name</label>
            <input
              autoComplete="off"
              ref={user_name_ref}
              type="text"
              className="form-control d-inline w-50"
              placeholder="Your name please..."
              name="UserName"
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="GameCode">Game Code</label>
          <input
            autoComplete="off"
            ref={game_code_ref}
            type="text"
            className="form-control d-inline w-50"
            placeholder="Game Code"
            name="GameCode"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary mb-2"
          onClick={JoinGame}
        >
          Join
        </button>
        <br />
      </div>
    </div>
  );
};

export default JoinGame;
