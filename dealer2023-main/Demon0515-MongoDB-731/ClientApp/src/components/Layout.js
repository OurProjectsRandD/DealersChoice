import React from "react";
import { Container } from "reactstrap";
import { NavMenu } from "./NavMenu";

const Layout = (props) => {
  return (
    <div className="container wider px-3 mb-2">
      <NavMenu />
      <Container className="p-3 wider">{props.children}</Container>
    </div>
  );
};

export default Layout;
