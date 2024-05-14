import React, { useCallback, useState } from "react";
import UsersRegisteredAndLoggedInNumberTable from "../../components/Tables/UsersRegisteredAndLoggedInNumberTable";
import { SendRequest } from "../../util/AxiosUtil";
import RegisteredUsersTable from "../../components/Tables/RegisteredUsersTable";
import SignInHistoryTable from "../../components/Tables/SignInHistoryTable";
import GameMonitorTable from "../../components/Tables/GameMonitorTable";
import GamesTable from "../../components/Tables/GamesTable";
const GameMontior = () => {
  const [data, setData] = useState([]);
  const [type, setType] = useState(0);
  const handleClick = useCallback((row, col) => {
    switch (row) {
      case 0:
        SendRequest({
          url: "Admin/get-games-by-period",
          method: "post",
          data: {
            Type: col,
          },
        }).then((result) => {
          setType(0);
          setData(result.data);
        });
        break;
      default:
        break;
    }
  }, []);
  return (
    <>
      <GameMonitorTable handleClick={handleClick}></GameMonitorTable>
      <hr />
      <GamesTable games={data} />
    </>
  );
};

export default GameMontior;
