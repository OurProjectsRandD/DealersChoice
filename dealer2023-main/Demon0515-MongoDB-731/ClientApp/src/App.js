import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import "./custom.css";
import { SendRequest } from "./util/AxiosUtil";
import SignIn from "./Pages/Auth/SignIn";
import SignUp from "./Pages/Auth/SignUp";
import Games from "./Pages/Game/Games";
import Home from "./Pages/Game/Home";
import MainGame from "./Pages/Game/Main";
import Features from "./Pages/LadningPages/Features";
import FreeTrial from "./Pages/LadningPages/FreeTrial";
import CardBackImage from "./components/MainGameComponents/CardBackImage";
import AccountSetting from "./Pages/Auth/AccountSetting";
import About from "./Pages/About";
import MembershipPlan from "./Pages/MembershipPlan";
import TokenPurchase from "./Pages/TokenPurchase";
import Purchase from "./Pages/Purchase";
import Support from "./Pages/Support";
import { useSelector, useDispatch } from "react-redux";
import { unAuthorized } from "./slice/authSlice";
import LogRocket from "./util/LogRocketUtil";
import UserManagement from "./Pages/AdminPages/UserManagement";
import AdminRoute from "./components/AdminRoute";
import GameMontior from "./Pages/AdminPages/GameMonitor";
import SalesTracking from "./Pages/AdminPages/SalesTracking";

const App = () => {
  const [isReloading, setIsReloading] = useState(false);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    SendRequest({
      method: "post",
      url: "auth/get-user",
    })
      .then((response) => {
        setIsReloading(false);
      })
      .catch(() => {
        localStorage.removeItem("jwt_token");
        dispatch(unAuthorized());
        setIsReloading(false);
      });
  }, []);

  if (!isReloading) {
    return (
      <>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route element={<Home />} path="/" />
              <Route element={<SignIn />} path="/auth/sign-in" />
              <Route element={<SignUp />} path="/auth/sign-up" />
              {auth.isAuthorized && (
                <Route element={<TokenPurchase />} path="/token-purchase" />
              )}
              {auth.isAuthorized && (
                <Route element={<MembershipPlan />} path="/membership-plan" />
              )}
              {auth.isAuthorized && (
                <Route element={<Purchase />} path="/purchase" />
              )}
              {auth.isAuthorized && (
                <Route element={<Games />} path="/game/games" />
              )}
              {auth.isAuthorized && (
                <Route
                  element={<AccountSetting />}
                  path="/auth/account-setting"
                />
              )}
              {auth.isAuthorized && (
                <Route element={<Support />} path="/support" />
              )}
              <Route
                path="/admin/user-manage"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/game-monitor"
                element={
                  <AdminRoute>
                    <GameMontior />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/sales-tracking"
                element={
                  <AdminRoute>
                    <SalesTracking />
                  </AdminRoute>
                }
              ></Route>
              <Route element={<MainGame />} path="/game/main-game" />
              <Route element={<About />} path="/about" />
              <Route element={<Features />} path="/landing/features" />
              <Route element={<FreeTrial />} path="/landing/free-trial" />
            </Routes>
          </Layout>
        </BrowserRouter>
        {/* This is for preloading cardback image. */}
        <CardBackImage />
      </>
    );
  } else {
    return <></>;
  }
};

export default App;
