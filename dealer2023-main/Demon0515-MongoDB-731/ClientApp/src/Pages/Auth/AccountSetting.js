import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { SendRequest } from "../../util/AxiosUtil";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../slice/authSlice";

const theme = createTheme();

export default function AccountSetting() {
  const navigator = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    SendRequest({
      method: "post",
      url: "auth/change-user-info",
      data: {
        FirstName: data.get("firstName"),
        LastName: data.get("lastName"),
        Username: data.get("firstName") + data.get("lastName"),
        DisplayName:
          data.get("firstName") + data.get("lastName").charAt(0).toUpperCase(),
        PrevPassword: data.get("prev_password"),
        Password: data.get("password"),
      },
    })
      .then((response) => {
        alert("Successful");
        dispatch(setUser(response.data));
        navigator("/");
      })
      .catch(({ response }) => {
        alert(response.data.message);
      });
  };

  const handleImageChange = React.useCallback(async (event) => {
    event.preventDefault();
    const selectedFile = event.currentTarget.files[0];
    if (selectedFile === undefined || selectedFile === null) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    SendRequest({
      method: "post",
      url: "auth/change-image",
      headers: {
        "Content-Type": "multipart/form-data", // Set the content type header to multipart/form-data to send files
      },
      data: formData,
    })
      .then(() => {
        alert("Successful");
      })
      .catch((error) => {
        alert(error.response.data);
      });
    return false;
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                {user.ImageFileName && user.ImageFileName.length > 0 && (
                  <Avatar
                    alt="profile image"
                    src={"/" + user.ImageFileName}
                    sx={{ width: 200, height: 200 }}
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={12}>
                <Typography>Choose your avatar</Typography>
                <TextField
                  fullWidth
                  type="file"
                  name="image"
                  placeholder="Choose your avatar"
                  onChange={handleImageChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  defaultValue={user.FirstName}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  defaultValue={user.LastName}
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="prev_password"
                  label="Previous Password"
                  type="password"
                  autoComplete="new-password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Change
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
