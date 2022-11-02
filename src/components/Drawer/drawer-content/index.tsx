import { useCallback, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import CastenIcon from "../../../assets/icons/Casten.png";
import { Skeleton } from "@material-ui/lab";
import "./drawer-content.scss";
import DocsIcon from "../../../assets/icons/stake.svg";
import classnames from "classnames";
import { useNavigate } from "react-router-dom";
import {
  DashboardIcon,
  SecurityIcon,
  PortfolioIcon,
  BorrowerIcon,
} from "./icons";

function NavContent() {
  const [active, setActive] = useState("security");
  const navigate = useNavigate();
  const navigateToPage = (route: string) => {
    navigate(route);
    setActive(route.substring(1));
  };

  return (
    <div className="dapp-sidebar">
      <div className="dapp-nav">
        <div className="dapp-menu-item" onClick={() => navigateToPage("/")}>
          <DashboardIcon />
          <p className={active === "" ? "text-special" : "text"}>Dashboard</p>
        </div>
        <div
          className={
            active === "portfolio" ? "dapp-menu-item-special" : "dapp-menu-item"
          }
          onClick={() => navigateToPage("/portfolio")}
        >
          <PortfolioIcon />
          <p className={active === "portfolio" ? "text-special" : "text"}>
            Portfolio Manager
          </p>
        </div>

        <div
          className={
            active === "borrower" ? "dapp-menu-item-special" : "dapp-menu-item"
          }
          onClick={() => navigateToPage("/borrower")}
        >
          <BorrowerIcon />
          <p className={active === "borrower" ? "text-special" : "text"}>
            Borrower Profile
          </p>
        </div>

        <div
          className={
            active === "token" ? "dapp-menu-item-special" : "dapp-menu-item"
          }
          onClick={() => navigateToPage("/token")}
        >
          <SecurityIcon />
          <p className={active === "token" ? "text-special" : "text"}>
            Token Offerings
          </p>
        </div>
      </div>

      {/* <Social /> */}
    </div>
  );
}

export default NavContent;
