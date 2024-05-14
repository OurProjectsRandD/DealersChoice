import React, { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import "./NavMenu.css";
import { SendRequest } from "../util/AxiosUtil";
import { useSelector, useDispatch } from "react-redux";
import { unAuthorized,setMeetingJoined } from "../slice/authSlice";
import { persistStore } from "redux-persist";
import { store } from "../store";
export const NavMenu = () => {
  const navigator = useNavigate();
  const [searchParams] = useSearchParams();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleSignOut = useCallback(() => {
    SendRequest({
      method: "post",
      url: "auth/sign-out",
    }).then(() => {
      localStorage.removeItem("jwt_token");
      dispatch(setMeetingJoined(false));
      dispatch(unAuthorized());
      navigator("/auth/sign-in");
    });
  }, []);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const navigate = useCallback(
    (url) => {
      if (searchParams.get("GameCode") !== null) {
        window.open(url, "_blank");
      } else navigator(url);
    },
    [searchParams]
  );

  return (
    <AppBar position="static" id="Menu">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}
            id="Home_Menu"
          >
            <Button
              key={0}
              sx={{ my: 2, color: "white", display: "block", mr: 2 }}
              onClick={() => {
                navigate("/");
              }}
              id="Home_Menu_Button"
              className="my-0"
            >
              <img
                alt="DealersChoice logo"
                className="img-fluid"
                src="/assets/images/Logo.jpg"
              />
            </Button>
          </Box>
          <Box
            sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}
            id="Games_Menu"
          >
            {!auth.isAuthorized && (
              <Typography
                variant="h4"
                component="div"
                sx={{ mr: 2 }}
                color="blue"
                className="btn"
                onClick={() => navigate("/about")}
              >
                About
              </Typography>
            )}
            {auth.isAuthorized && (
              <>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ mr: 2 }}
                  color="blue"
                  className="btn"
                  onClick={() => {
                    navigate("/game/games");
                  }}
                >
                  Games
                </Typography>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ mr: 2 }}
                  color="blue"
                  className="btn"
                  onClick={() => {
                    navigate("/purchase");
                  }}
                >
                  Purchases
                </Typography>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ mr: 2 }}
                  color="blue"
                  className="btn"
                  onClick={() => {
                    navigate("/support");
                  }}
                >
                  Support
                </Typography>
              </>
            )}
          </Box>
          <Box sx={{ flexGrow: 0 }} id="Account_Menu">
            {auth.isAuthorized && (
              <>
                <Tooltip title="Open settings">
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ mr: 2 }}
                    color="blue"
                    className="btn"
                    onClick={handleOpenUserMenu}
                  >
                    {`${auth.user.DisplayName} (${auth.asset.Tokens})`}
                  </Typography>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem
                    key={0}
                    onClick={() => {
                      setAnchorElUser(null);
                      navigate("/auth/account-setting");
                    }}
                  >
                    <Typography textAlign="center">Account Setting</Typography>
                  </MenuItem>
                  <MenuItem
                    key={1}
                    onClick={() => {
                      setAnchorElUser(null);
                    }}
                  >
                    <Typography textAlign="center">Purchase history</Typography>
                  </MenuItem>
                  <MenuItem key={2} onClick={handleSignOut}>
                    <Typography textAlign="center">Sign Out</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
            {!auth.isAuthorized && (
              <div id="Sign_In_Menu">
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ flexGrow: 1 }}
                  color="blue"
                  className="btn"
                  id="Sign_In_Menu_Button"
                  onClick={() => {
                    navigate("/auth/sign-in");
                  }}
                >
                  Sign In
                </Typography>
              </div>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
