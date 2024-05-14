import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { GenerateCode } from "../../common/game/basic";
import { SendRequest } from "../../util/AxiosUtil";
import { v4 as uuid } from "uuid";
import { createMeeting } from "../../util/VideoSDK";
import MembershipPlanTable from "../../components/Tables/MembershipPlanTable";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../slice/authSlice";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Check } from "@mui/icons-material";
import { setMeetingId } from "../../slice/gameStateSlice";
import LogRocket from "../../util/LogRocketUtil";

const Home = () => {
  const navigator = useNavigate();
  const host_name_ref = useRef(null);
  const invitation_code_ref = useRef(null);
  const create_user_name_ref = useRef(null);
  const join_user_name_ref = useRef(null);
  const game_code_ref = useRef(null);
  const [recurring, setRecurring] = useState(false);
  const [onlyInvitees, setOnlyInvitees] = useState(false);
  const [videoChatAllow, setVideoChatAllow] = useState(false);
  const [copyButtonVisible, setCopyButtonVisible] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const copyInvitation = useCallback(() => {
    /* Select the text field */
    invitation_code_ref.current.select();
    invitation_code_ref.current.setSelectionRange(0, 99999);

    /* Copy the text inside the text field */
    window.navigator.clipboard.writeText(invitation_code_ref.current.value);
    setCopyButtonVisible(false);
    /* Alert the copied text */
  }, [invitation_code_ref]);

  const handleCreate = useCallback(() => {
    if (
      !auth.isAuthorized &&
      create_user_name_ref.current.value.trim().length === 0
    ) {
      alert("Input User Name");
    }
    if (auth.isAuthorized && host_name_ref.current.value.trim().length === 0) {
      alert("Input host name");
    } else {
      invitation_code_ref.current.value = GenerateCode();
      setCopyButtonVisible(true);
    }
  }, [auth]);

  const handleStart = useCallback(async () => {
    if (
      !auth.isAuthorized &&
      create_user_name_ref.current.value.trim(" ").length === 0
    ) {
      alert("Input User Name");
      return;
    }

    if (
      auth.isAuthorized &&
      host_name_ref.current.value.trim(" ").length === 0
    ) {
      alert("Input Host Name");
      return;
    }

    if (invitation_code_ref.current.value.trim(" ").length === 0) {
      alert("Generate Invitation code first");
      return;
    }

    if (
      !auth.isAuthorized &&
      create_user_name_ref.current.value.trim(" ").length > 15
    ) {
      alert("Name must be less than 15 letters");
      return;
    }

    let tUser = null;

    if (!auth.isAuthorized) {
      tUser = {
        DisplayName: create_user_name_ref.current.value,
        NickName: create_user_name_ref.current.value,
        Id: uuid(),
      };
      dispatch(setUser(tUser));
    } else
      dispatch(
        setUser({
          NickName: create_user_name_ref.current.value,
        })
      );

    let HostName = auth.isAuthorized ? host_name_ref.current.value : "";
    let GameCode = invitation_code_ref.current.value;
    setIsCreating(true);

    //video chat allowed
    let meetingId = null;
    if (videoChatAllow) {
      meetingId = await createMeeting();
      if (meetingId === null) {
        alert("Can't Create Video Meeting.");
        setIsCreating(false);
        return;
      }
    } else meetingId = null;
    const realUserId = auth.isAuthorized ? auth.user.Id : tUser.Id;
    const realDisplayName = auth.isAuthorized
      ? auth.user.DisplayName
      : create_user_name_ref.current.value;
    SendRequest({
      method: "post",
      url: "Game/CreateGame",
      data: {
        HostName: HostName,
        MeetingId: meetingId,
        UserId: realUserId,
        DisplayName: realDisplayName,
        GameCode: GameCode,
        IsRecurring: recurring,
        IsInvitesOnly: onlyInvitees,
        VideoChatAllowed: videoChatAllow,
      },
    }).then((result) => {
      if (result.data) {
        LogRocket.identify(realUserId, {
          name: realDisplayName,
        });
        let link = "/game/main-game?GameCode=" + GameCode;
        if (meetingId !== null && meetingId !== undefined)
          link += `&MeetingId=${meetingId}`;
        navigator(link);
      }
    });
  }, [auth, dispatch, navigator, onlyInvitees, recurring, videoChatAllow]);

  const JoinGame = useCallback(() => {
    if (
      !auth.isAuthorized &&
      join_user_name_ref.current.value.trim(" ").length === 0
    ) {
      alert("Input User Name");
      return;
    } else if (game_code_ref === null) {
      alert("Input Game Code");
      return;
    } else if (
      !auth.isAuthorized &&
      join_user_name_ref.current.value.trim(" ").length > 15
    ) {
      alert("Name must be less than 15 letters");
      return;
    }
    const userId = uuid();
    if (!auth.isAuthorized) {
      dispatch(
        setUser({
          Id: userId,
          DisplayName: join_user_name_ref.current.value,
          NickName: join_user_name_ref.current.value,
        })
      );
    } else
      dispatch(
        setUser({
          NickName: join_user_name_ref.current.value,
        })
      );

    LogRocket.identify(auth.isAuthorized ? auth.user.Id : userId, {
      name: auth.isAuthorized
        ? auth.user.DisplayName
        : join_user_name_ref.current.value,
    });
    let link = "/game/main-game?GameCode=" + game_code_ref.current.value;
    SendRequest({
      url: "Game/GetMeetinId",
      method: "post",
      data: {
        GameCode: game_code_ref.current.value,
      },
    }).then((result) => {
      if (result.data !== null) {
        link += `&MeetingId=${result.data}`;
      }
      navigator(link);
    });
  }, [auth, dispatch, navigator]);

  if (!isCreating)
    return (
      <div className="container p-2">
        <div className="row banner my-5">
          <div className="col-12 text-center">
            <h1>DealersChoice.club</h1>
            <h3>
              <u>Your</u> games, <u>your</u> rules.
            </h3>
            <h3>
              <u>Your</u> club.
            </h3>
          </div>
        </div>

        <div className="row call-out my-5 MainPageDivTitle">
          <div className="col-md-8 m-2">
            <h2>Members can</h2>
            <div>
              <ul>
                <li>
                  <h3>Save guest lists</h3>
                </li>
                <li>
                  <h3>Schedule games</h3>
                </li>
                <li>
                  <h3>Save game history</h3>
                </li>
                <li>
                  <h3>
                    Access premium features like ad-free games, in-game video,
                    and more!
                  </h3>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-3 my-auto mx-auto cta">
            <h2>
              <a href="/auth/sign-up" className="join-btn btn fs-2 px-4 py-2">
                Join Now<span className="fs-5 d-block">for free!</span>
              </a>
            </h2>
          </div>
        </div>
        <div className="row create-join mt-5 justify-content-between">
          <div className="col-12 m-2 MainPageDivTitle">
            <h2>Play for free</h2>
          </div>
          <div className="col-md-6 m-2 MainPageDivs">
            <h2>HOST: Create a Game</h2>
            <ul>
              <li>Click the "Create" button</li>
              <li>Share the invitation code number with your friends</li>
              <li>Click the "Start" button</li>
            </ul>
            <div className="form-group mt-2">
              <label htmlFor="GameName">UserName</label>
              <input
                autoComplete="off"
                ref={create_user_name_ref}
                type="text"
                defaultValue={auth.user.DisplayName}
                className="ms-2 form-control d-inline w-50"
                placeholder="Your name please..."
                name="UserName"
                required
              />
            </div>
            <div className="form-group mt-2">
              <label htmlFor="GameName">GameName</label>
              <input
                autoComplete="off"
                ref={host_name_ref}
                type="text"
                className="ms-2 form-control d-inline w-50"
                id="GameName"
                placeholder="Game name"
                name="GameName"
                required
              />
              <button className="btn btn-primary ms-2" onClick={handleCreate}>
                Create
              </button>
            </div>
            <div className="form-group">
              <div className="d-flex m-2 text-center"></div>
              <div>
                <label htmlFor="pwd">Invitation Code:</label>
                <input
                  autoComplete="off"
                  type="text"
                  className="ms-2 form-control w-50 d-inline"
                  id="GameCode"
                  placeholder="Code to share"
                  name="GameCode"
                  ref={invitation_code_ref}
                  required
                  readOnly
                />
                <button className="ms-2 btn">
                  {copyButtonVisible ? (
                    <ContentCopyIcon onClick={copyInvitation} />
                  ) : (
                    <CheckCircleOutlineIcon />
                  )}
                </button>
              </div>
            </div>
            {auth.isAuthorized && (
              <>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox onChange={() => setRecurring(!recurring)} />
                    }
                    label="Create as recurring game"
                  />
                </FormGroup>
                <FormGroup>
                  <FormControlLabel
                    checked={onlyInvitees}
                    control={
                      <Checkbox
                        onChange={() => setOnlyInvitees(!onlyInvitees)}
                      />
                    }
                    label="Only Invitees can join this game"
                  />
                </FormGroup>
                <FormGroup>
                  <FormControlLabel
                    checked={videoChatAllow}
                    control={
                      <Checkbox
                        onChange={() => setVideoChatAllow(!videoChatAllow)}
                      />
                    }
                    label="Allow Video Chat"
                  />
                </FormGroup>
              </>
            )}
            &nbsp;
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary mb-2"
                onClick={handleStart}
              >
                Start Game
              </button>
              <br />
            </div>
          </div>
          <div className="col-md-5 m-2 MainPageDivs">
            <h2>GUEST: Join a Game</h2>
            <ul>
              <li>Paste the invitation code</li>
              <li>Click the "Join" button</li>
            </ul>
            <div className="form-group mb-2">
              <label htmlFor="UserName">UserName</label>
              <input
                autoComplete="off"
                ref={join_user_name_ref}
                defaultValue={auth.user.DisplayName}
                type="text"
                className="ms-2 form-control d-inline w-50"
                placeholder="Your name please..."
                name="UserName"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="GameCode">Game Code</label>
              <input
                autoComplete="off"
                ref={game_code_ref}
                type="text"
                className="ms-2 form-control d-inline w-50"
                placeholder="Game Code"
                name="GameCode"
                required
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary mt-2 mb-2"
                onClick={JoinGame}
              >
                Join
              </button>
              <br />
            </div>
          </div>
        </div>
        {auth.asset && auth.asset.MembershipPlanId === 1 && (
          <div className="row mt-5">
            <MembershipPlanTable />
          </div>
        )}
      </div>
    );
  return <img src="assets/images/loading.gif" alt="" />;
};

export default Home;
