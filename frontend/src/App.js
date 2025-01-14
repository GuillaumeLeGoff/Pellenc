import { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { Box, GlobalStyles, Grid } from "@mui/material";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import { darkTheme } from "./themes/darkTheme.ts";
import { clairTheme } from "./themes/clairTheme.ts";
import Header from "./components/common/Header";
import NavBar from "./components/common/NavBar";
import Login from "./components/login/Login";
import DashBoard from "./components/dashboard/Dashboard";
import { useThemeMode } from "./context/ThemeModeContext";
import "./styles/Global.css";
import Settings from "./components/settings/settings.js";
import NotificationNewYearDialog from "./components/dialogs/NotificationNewYearDialogs.js";
import { accidentService } from "./services/AccidentServices.js";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const { themeMode } = useThemeMode();
    const [open, setOpen] = useState(false);


    useEffect(() => {
        setToken(localStorage.getItem("token"));
        if (token) {
            accidentService.getAccident().then((data) => {
                console.log("data", data[0]);
                setOpen(data[0].resetOnNewYear);
            });
        }
    }, [token]);
    const theme = themeMode === "dark" ? darkTheme : clairTheme;

    const updateToken = (newToken) => {
        setToken(newToken);
        localStorage.setItem("token", newToken);
    };

    function setNotificationNewYear(reset) {
        accidentService.resetOneNewYear(reset).then((data) => {
            window.location.reload();
        });


    }

    return (
        <MuiThemeProvider theme={theme}>
            <GlobalStyles
                styles={{
                    body: {
                        backgroundColor: theme.palette.background.default,
                    },
                }}
            />
            <Router>
                <Header themeMode={themeMode} />
                <Box className="mainContainer">
                    {token ? (
                        <>
                            <Routes>
                                <Route path="*" element={<Navigate to="/dashboard" />} />
                                <Route path="/dashboard" element={<DashBoard />} />
                                <Route path="/settings" element={<Settings />} />
                            </Routes>
                        </>
                    ) : (
                        <Grid container className="loginContainer">
                            <Routes>
                                <Route path="*" element={<Navigate to="/login" />} />
                                <Route
                                    path="login"
                                    element={<Login updateToken={updateToken} />}
                                />
                            </Routes>
                        </Grid>
                    )}
                </Box>
                {token ? (
                    <Box>
                        <NavBar />
                    </Box>
                ) : null}
            </Router>
            <NotificationNewYearDialog open={open}
                onClose={() => setOpen(false)}
                onToggle={setNotificationNewYear}
            />
        </MuiThemeProvider>
    );
}

export default App;
