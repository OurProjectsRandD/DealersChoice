import React from "react";
import MembershipPlanTable from "../components/Tables/MembershipPlanTable";
import PurchaseTable from "../components/Tables/PurchaseTable";

const Purchase = () => {
  return (
    <>
      <PurchaseTable />
      <hr />
      <MembershipPlanTable />
    </>
  );
};

export default Purchase;
