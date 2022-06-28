import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Social from "./social";
import MetapolyIcon from "../../../assets/icons/metapoly-nav-header.png";
import { trim, shorten } from "../../../helpers";
import { useAddress } from "../../../hooks";
import useBonds from "../../../hooks/bonds";
import { Link } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import "./drawer-content.scss";
import DocsIcon from "../../../assets/icons/stake.svg";
import classnames from "classnames";

import DashboardIcon from "./icons/DashboardIcon";
import StakeIcon from "./icons/StakeIcon";
import BondIcon from "./icons/BondIcon";
import CalculatorIcon from "./icons/CalculatorIcon";
import MintIcon from "./icons/MintIcon";
import LendBorrowIcon from "./icons/LendBorrowIcon";
import ConverterIcon from "./icons/ConverterIcon";
import BiconomyTimer from "src/components/BiconomyTimer/BiconomyTimer";

function NavContent() {
    const [isActive] = useState();
    const address = useAddress();
    const { bonds } = useBonds();

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
            <div className="branding-header">
                <Link href="https://metapoly.org" target="_blank">
                    <img alt="Metapoly.org" src={MetapolyIcon} height="28" />
                </Link>

                {address && (
                    <div className="wallet-link">
                        <Link href={`https://cchain.explorer.avax.network/address/${address}`} target="_blank">
                            <p>{shorten(address)}</p>
                        </Link>
                    </div>
                )}
            </div>

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
                        to="/stake"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "stake");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <StakeIcon />
                            <p>Stake</p>
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
                            <BondIcon />
                            <p>Bond</p>
                        </div>
                    </Link>

                    <Link
                        component={NavLink}
                        to="/lend-borrow"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "lend-borrow");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <LendBorrowIcon />
                            <p>Lend / Borrow</p>
                        </div>
                    </Link>

                    <Link
                        component={NavLink}
                        to="/convert"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "convert");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <ConverterIcon />
                            <p>Convert</p>
                        </div>
                    </Link>

                    {/* <Link
                        component={NavLink}
                        to="/calculator"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "calculator");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <CalculatorIcon />
                            <p>Calculator</p>
                        </div>
                    </Link> */}

                    <Link
                        component={NavLink}
                        to="/mint"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "mint");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <MintIcon />
                            <p>Mint</p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="dapp-happy-hour">
                <BiconomyTimer />
            </div>

            <div className="dapp-menu-doc-link">
                <Link href="https://metapoly-team.gitbook.io/doc/" target="_blank">
                    <img alt="" src={DocsIcon} />
                    <p>Docs</p>
                </Link>
            </div>
            <Social />
        </div>
    );
}

export default NavContent;
