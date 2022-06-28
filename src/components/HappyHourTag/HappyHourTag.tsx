import { useSelector } from "react-redux";
import { ReactComponent as ConfettiIcon } from "src/assets/icons/confetti.svg";
import { IReduxState } from "src/store/slices/state.interface";
import "./happy-hour-tag.scss";

function HappyHourTag() {
    const happyHourEvent = useSelector<IReduxState, any>(state => state.biconomy.eventInfo);

    return happyHourEvent !== undefined && happyHourEvent !== null
        ? <div className="happy-hour-tag">
            <ConfettiIcon />
            <span style={{ marginLeft: "8px" }}>Happy Hour</span>
        </div>
        : null;
}

export default HappyHourTag;