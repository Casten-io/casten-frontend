import { SvgIcon, Link } from "@material-ui/core";
import { ReactComponent as GitHub } from "../../../assets/icons/github.svg";
import { ReactComponent as Twitter } from "../../../assets/icons/twitter.svg";
import { ReactComponent as Telegram } from "../../../assets/icons/telegram.svg";
import { ReactComponent as Discord } from "../../../assets/icons/discord.svg";

export default function Social() {
    return (
        <div className="social-row">
            <Link href="https://twitter.com/metapolyorg" target="_blank">
                <SvgIcon color="primary" component={Twitter} />
            </Link>

            <Link href="https://discord.gg/BxctC7ExgA" target="_blank">
                <SvgIcon color="primary" component={Discord} />
            </Link>

            <Link href="https://github.com/metapolyorg" target="_blank">
                <SvgIcon color="primary" component={GitHub} />
            </Link>
        </div>
    );
}
