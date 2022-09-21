import { Theme } from "@mui/material/styles";
import { Drawer } from "@mui/material";
import DrawerContent from "./drawer-content";
import { DRAWER_WIDTH } from "../../constants/style";
import { makeStyles } from "@mui/styles";
import "./mobile.scss";

// const useStyles = makeStyles((theme: Theme) => ({
//   drawer: {
//     [theme.breakpoints.up("md")]: {
//       width: DRAWER_WIDTH,
//       flexShrink: 0,
//     },
//   },
//   drawerPaper: {
//     width: DRAWER_WIDTH,
//     borderRight: 0,
//   },
// }));

interface INavDrawer {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

function NavDrawer({ mobileOpen, handleDrawerToggle }: INavDrawer) {
  // const classes = useStyles();

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      onClick={handleDrawerToggle}
      className="drawer"
      ModalProps={{
        keepMounted: true,
      }}
    >
      <DrawerContent />
    </Drawer>
  );
}

export default NavDrawer;
