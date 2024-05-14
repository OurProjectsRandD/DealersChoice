import React, { useCallback, useState } from "react";
import UsersRegisteredAndLoggedInNumberTable from "../../components/Tables/UsersRegisteredAndLoggedInNumberTable";
import { SendRequest } from "../../util/AxiosUtil";
import RegisteredUsersTable from "../../components/Tables/RegisteredUsersTable";
import SignInHistoryTable from "../../components/Tables/SignInHistoryTable";
import GameMonitorTable from "../../components/Tables/GameMonitorTable";
import GamesTable from "../../components/Tables/GamesTable";
import SalesTrackingTable from "../../components/Tables/SalesTrackingTable";
import TransactionsTable from "../../components/Tables/TransactionsTable";
const SalesTracking = () => {
  const [data, setData] = useState([]);
  const [type, setType] = useState(0);
  const handleClick = useCallback((row, col) => {
    switch (row) {
      case 0:
        SendRequest({
          url: "Admin/get-transactions",
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
      <SalesTrackingTable handleClick={handleClick} />
      <hr />
      <TransactionsTable transactions={data} />
    </>
  );
};

export default SalesTracking;
