import { SendRequest } from "./AxiosUtil";
import LogRocket from "./LogRocketUtil";
export const authToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJhZDRhYWM0YS0xYjUzLTRiZjMtOTUyMS05MmVmOWRmYjE0MDMiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY4Njg5NzU0NSwiZXhwIjoxODQ0Njg1NTQ1fQ.O0xy5Xoz9DxE-Rs2sQ9Y7QX5T7lw2hDgdY63ss2ZMW8";

export const createMeeting = async () => {
  try {
    const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
      method: "POST",
      headers: {
        authorization: `${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    //Destructuring the roomId from the response
    const data = await res.json();
    LogRocket.log("Created Meeting", data);
    return data.roomId;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getMinutes = async (roomId) => {
  try {
    const res = await fetch(
      `https://api.videosdk.live/v2/sessions?roomId=${roomId}`,
      {
        method: "GET",
        headers: {
          authorization: `${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const { data } = await res.json();
    console.log("Room Data", data);
    let minutes = 0;
    data.forEach((session) => {
      session.participants.forEach((participant) => {
        participant.timelog.forEach((timelog) => {
          minutes += Math.ceil(
            Math.abs(
              (timelog.end === null ? new Date() : new Date(timelog.end)) -
                new Date(timelog.start)
            ) / 60000.0
          );
        });
      });
    });
    return minutes;
  } catch (e) {
    console.log(e);
    return 0;
  }
};

/*

displayName
: 
"testB"
eventEmitter
: 
a {_events: {…}, _eventsCount: 0, _maxListeners: undefined}
id
: 
"964e13d7-64ff-43da-9a03-d300a71e6a86"
local
: 
false
micOn
: 
false
mode
: 
"CONFERENCE"
pinState
: 
{cam: false, share: false}
quality
: 
"low"
streams
: 
Map(0) {size: 0}
webcamOn
: 
false

*/
