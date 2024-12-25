import { Admin, Resource, CustomRoutes } from "react-admin";
import { Route } from "react-router-dom";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { CourseList } from "./components/CourseList";
import { CourseEdit } from "./components/CourseEdit";
import { CourseCreate } from "./components/CourseCreate";
import UnitList from "./components/UnitList";
import UnitEdit from "./components/UnitEdit";
import UnitCreate from "./components/UnitCreate";
import ModuleList from "./components/ModuleList";
import ModuleEdit from "./components/ModuleEdit";
import ModuleCreate from "./components/ModuleCreate";
import SchoolIcon from "@mui/icons-material/School";
import { ThemeOptions, createTheme } from "@mui/material";

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      //   main: "#2196f3",
      main: "#023D54",
    },
    secondary: {
      //   main: "#ff4081",
      main: "#159668",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0px 3px 15px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
};

const darkThemeOptions: ThemeOptions = {
  ...themeOptions,
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
};

export const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    title="AlgoLearn Admin"
    theme={createTheme(themeOptions)}
    darkTheme={createTheme(darkThemeOptions)}
  >
    <Resource
      name="courses"
      list={CourseList}
      edit={CourseEdit}
      create={CourseCreate}
      icon={SchoolIcon}
    />
    <CustomRoutes>
      <Route path="/units" element={<UnitList />} />
      <Route path="/units/create" element={<UnitCreate />} />
      <Route path="/units/:id" element={<UnitEdit />} />
      <Route path="/modules" element={<ModuleList />} />
      <Route path="/modules/create" element={<ModuleCreate />} />
      <Route path="/modules/:id" element={<ModuleEdit />} />
    </CustomRoutes>
  </Admin>
);
