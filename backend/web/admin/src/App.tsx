import { Admin, Resource, CustomRoutes, Layout } from "react-admin";
import { Route } from "react-router-dom";
import { dataProvider } from "./services/dataProvider";
import { authProvider } from "./services/authProvider";
import { CourseList } from "./components/resources/CourseList";
import { CourseEdit } from "./components/resources/CourseEdit";
import { CourseCreate } from "./components/resources/CourseCreate";
import UnitList from "./components/resources/UnitList";
import UnitEdit from "./components/resources/UnitEdit";
import UnitCreate from "./components/resources/UnitCreate";
import ModuleList from "./components/resources/ModuleList";
import ModuleEdit from "./components/resources/ModuleEdit";
import ModuleCreate from "./components/resources/ModuleCreate";
import { UserList } from "./components/resources/UserList";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import { createTheme } from "@mui/material";
import { Dashboard } from "./pages/Dashboard";
import { themeOptions, darkThemeOptions } from "./theme";
import { AppBar } from "./components/common/AppBar";
import { Sidebar } from "./components/common/Sidebar";

const CustomLayout = (props: any) => (
  <Layout {...props} appBar={AppBar} sidebar={Sidebar} />
);

export const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    title="AlgoLearn Admin"
    theme={createTheme(themeOptions)}
    darkTheme={createTheme(darkThemeOptions)}
    layout={CustomLayout}
  >
    <Resource
      name="courses"
      list={CourseList}
      edit={CourseEdit}
      create={CourseCreate}
      icon={SchoolIcon}
    />
    <Resource name="users" list={UserList} icon={PeopleIcon} />
    <CustomRoutes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/units" element={<UnitList />} />
      <Route path="/units/create" element={<UnitCreate />} />
      <Route path="/units/:id" element={<UnitEdit />} />
      <Route path="/modules" element={<ModuleList />} />
      <Route path="/modules/create" element={<ModuleCreate />} />
      <Route path="/modules/:id" element={<ModuleEdit />} />
    </CustomRoutes>
  </Admin>
);
