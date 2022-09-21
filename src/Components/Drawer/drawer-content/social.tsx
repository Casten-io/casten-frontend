import { SvgIcon, Link } from "@mui/material";
import { ReactComponent as GitHub } from "../../../assets/icons/github.svg";
import { ReactComponent as Twitter } from "../../../assets/icons/twitter.svg";
import { ReactComponent as Telegram } from "../../../assets/icons/telegram.svg";
import { ReactComponent as Discord } from "../../../assets/icons/discord.svg";

export default function Social() {
  return (
    <div className="social-row">
      <Link href="#" target="_blank">
        <SvgIcon color="primary" component={Twitter} />
      </Link>

      <Link href="#" target="_blank">
        <SvgIcon color="primary" component={Discord} />
      </Link>

      <Link href="#" target="_blank">
        <SvgIcon color="primary" component={GitHub} />
      </Link>
    </div>
  );
}
