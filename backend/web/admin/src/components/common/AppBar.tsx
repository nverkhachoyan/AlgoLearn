import {
  AppBar as RaAppBar,
  ToggleThemeButton,
  Logout,
  UserMenu,
  useAuthenticated,
} from "react-admin";

export const AppBar = () => {
  useAuthenticated();

  return (
    <RaAppBar
      userMenu={
        <UserMenu>
          <ToggleThemeButton />
          <Logout />
        </UserMenu>
      }
    />
  );
};
