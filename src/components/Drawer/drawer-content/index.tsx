import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Social from "./social";
import CastenIcon from "../../../assets/icons/Casten.png";
// import { trim, shorten } from "../../../helpers";
// import { useAddress } from "../../../hooks";
// import useBonds from "../../../hooks/bonds";
import { Link } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import "./drawer-content.scss";
import DocsIcon from "../../../assets/icons/stake.svg";
import classnames from "classnames";

import DashboardIcon from "./icons/DashboardIcon";

function NavContent() {
  const [isActive] = useState();
  //   const address = useAddress();
  //   const { bonds } = useBonds();

  const checkPage = useCallback((location: any, page: string): boolean => {
    const currentPath = location.pathname.replace("/", "");
    if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
      return true;
    }
    if (currentPath.indexOf("stake") >= 0 && page === "stake") {
      return true;
    }
    if (currentPath.indexOf("bonds") >= 0 && page === "bonds") {
      return true;
    }
    if (currentPath.indexOf("calculator") >= 0 && page === "calculator") {
      return true;
    }
    if (currentPath.indexOf("convert") >= 0 && page === "convert") {
      return true;
    }
    if (currentPath.indexOf("mint") >= 0 && page === "mint") {
      return true;
    }
    if (currentPath.indexOf("lend-borrow") >= 0 && page === "lend-borrow") {
      return true;
    }
    return false;
  }, []);

  return (
    <div className="dapp-sidebar">
      <div className="dapp-menu-links">
        <div className="dapp-nav">
          <Link
            component={NavLink}
            to="/dashboard"
            isActive={(match: any, location: any) => {
              return checkPage(location, "dashboard");
            }}
            className={classnames("button-dapp-menu", { active: isActive })}
          >
            <div className="dapp-menu-item">
              <DashboardIcon />
              <p>Dashboard</p>
            </div>
          </Link>

          <Link
            component={NavLink}
            to="/borrower"
            isActive={(match: any, location: any) => {
              return checkPage(location, "convert");
            }}
            className={classnames("button-dapp-menu", { active: isActive })}
          >
            <div className="dapp-menu-item">
              <DashboardIcon />
              <p>Borrower Profile</p>
            </div>
          </Link>

          <Link
            component={NavLink}
            to="/credit-profile"
            isActive={(match: any, location: any) => {
              return checkPage(location, "credit-profile");
            }}
            className={classnames("button-dapp-menu", { active: isActive })}
          >
            <div className="dapp-menu-item">
              <DashboardIcon />
              <p>Credit and Financial Profile</p>
            </div>
          </Link>

          <Link
            component={NavLink}
            id="bond-nav"
            to="/bonds"
            isActive={(match: any, location: any) => {
              return checkPage(location, "bonds");
            }}
            className={classnames("button-dapp-menu", { active: isActive })}
          >
            <div className="dapp-menu-item">
              <DashboardIcon />
              <p>ESG Profile</p>
            </div>
          </Link>

          <Link
            component={NavLink}
            to="/security"
            isActive={(match: any, location: any) => {
              return checkPage(location, "location");
            }}
            className={classnames("button-dapp-menu", { active: isActive })}
          >
            <div className="dapp-menu-item">
              <DashboardIcon />
              <p>Security Offerings</p>
            </div>
          </Link>

          <Link
            component={NavLink}
            to="/portfolio"
            isActive={(match: any, location: any) => {
              return checkPage(location, "location");
            }}
            className={classnames("button-dapp-menu", { active: isActive })}
          >
            <div className="dapp-menu-item">
              <DashboardIcon />
              <p>Portfolio Manager</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="dapp-menu-doc-link">
        <Link href="#" target="_blank">
          <img alt="" src={DocsIcon} />
          <p>Docs</p>
        </Link>
      </div>
      <Social />
    </div>
  );
}

export default NavContent;
