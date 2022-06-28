import "./biconomy-save.scss";
import { ReactComponent as ConfettiIcon } from "../../assets/icons/confetti.svg";
import { ReactComponent as DiscountIcon } from "../../assets/icons/Illustration.svg";

function BiconomySave({ amount } : {amount?: string}) {
    return <div className="biconomy-save-container">
        <div className="description-container">
            <div className="title-container">
                <ConfettiIcon/>
                <span className="title">Happy Hour Applied</span>
                <ConfettiIcon/>
            </div>
            <span className="description">You will save {amount !== undefined ? parseFloat(amount).toFixed(6) : "0.0000"} amount in ETH</span>
        </div>

        <DiscountIcon/>
    </div>
}

export default BiconomySave;