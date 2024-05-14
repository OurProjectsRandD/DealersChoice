import React, { useCallback, useState } from "react";
import UsersRegisteredAndLoggedInNumberTable from "../../components/Tables/UsersRegisteredAndLoggedInNumberTable";
import { SendRequest } from "../../util/AxiosUtil";
import RegisteredUsersTable from "../../components/Tables/RegisteredUsersTable";
import SignInHistoryTable from "../../components/Tables/SignInHistoryTable";
const UserManagement = () => {
  const [data, setData] = useState([]);
  const [type, setType] = useState(0);
  const handleClick = useCallback((row, col) => {
    switch (row) {
      case 0:
        SendRequest({
          url: "Admin/get-registered-users",
          method: "post",
          data: {
            Type: col,
          },
        }).then((result) => {
          setType(0);
          setData(result.data);
        });
        break;
      case 1:
        SendRequest({
          url: "Admin/get-loggedIn-users",
          method: "post",
          data: {
            Type: col,
          },
        }).then((result) => {
          setType(1);
          setData(result.data);
        });
        break;
      default:
        break;
    }
  }, []);
  return (
    <>
      <UsersRegisteredAndLoggedInNumberTable
        handleClick={handleClick}
      ></UsersRegisteredAndLoggedInNumberTable>
      <hr />
      {type === 0 ? (
        <RegisteredUsersTable users={data} />
      ) : (
        <SignInHistoryTable histories={data} />
      )}
    </>
  );
};

export default UserManagement;
