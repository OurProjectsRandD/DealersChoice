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

const theme = createTheme();

export default function SignUp() {
  const navigator = useNavigate();
  const [imageFileName, setImageFileName] = React.useState("");
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    SendRequest({
      method: "post",
      url: "auth/sign-up",
      data: {
        ImageFileName: imageFileName,
        Email: data.get("email"),
        FirstName: data.get("firstName"),
        LastName: data.get("lastName"),
        Username: data.get("firstName") + data.get("lastName"),
        DisplayName:
          data.get("firstName") + data.get("lastName").charAt(0).toUpperCase(),
        Password: data.get("password"),
      },
    })
      .then((response) => {
        navigator("/auth/sign-in");
      })
      .catch(({ response }) => {
        alert(response.data.message);
      });
  };

  const handleImageChange = async (event) => {
    event.preventDefault();
    const selectedFile = event.currentTarget.files[0];
    if (selectedFile === undefined || selectedFile === null) return;
    SendRequest({
      method: "post",
      url: "auth/upload-image",
      headers: {
        "Content-Type": "multipart/form-data", // Set the content type header to multipart/form-data to send files
      },
      data: {
        file: selectedFile,
      },
    })
      .then((response) => {
        setImageFileName(response.data);
      })
      .catch((error) => {
        alert(error.response.data);
      });
  };

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
                {imageFileName.length > 0 && (
                  <Avatar
                    alt="profile image"
                    src={"/" + imageFileName}
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
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
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
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="auth/sign-in" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
