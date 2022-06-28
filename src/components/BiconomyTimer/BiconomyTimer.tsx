import { useEffect, useState } from "react";
import useBiconomy from "src/hooks/biconomy/useBiconomy";
import { useDispatch, useSelector } from "react-redux";
import { IReduxState } from "src/store/slices/state.interface";
import useCountDown from "react-countdown-hook";
import { saveHappyHourInfo } from "src/store/slices/biconomy-slice";
import "./biconomy-timer.scss";
import { useWeb3Context } from "src/hooks";
import { ReactComponent as ConfettiIcon} from "src/assets/icons/confetti.svg";

function BiconomyTimer() { 
    const dispatch = useDispatch();
    const { checkOngoingEvent } = useBiconomy();
    const { chainID, address, provider } = useWeb3Context();
    const happyHourEvent = useSelector<IReduxState, any>(state => state.biconomy.eventInfo);
    const isHappyHour = useSelector<IReduxState, boolean>(state => state.biconomy.happyHour);

    const [timeLeft, { start }] = useCountDown(0, 1000);

    useEffect(() => {
        checkOngoingEvent();
    }, [provider,chainID, address]);


    // Reset info in store if event is finished
    useEffect(() => {
        if(isHappyHour && timeLeft === 0) {
            dispatch(saveHappyHourInfo({
                eventInfo: null, 
                happyHour: false,
                biconomy: null, 
                signer: null
            }))
        }
    }, [timeLeft]);

    // Handle after get happy hour event
    useEffect(() => {
        if(happyHourEvent !== undefined && happyHourEvent !== null) {
            const initial = calculateEventDuration(happyHourEvent.endTime);
            start(initial);
        }
    }, [happyHourEvent])

    const calculateEventDuration = (endTime: number) => {
        return endTime - Date.now();
    }

    const toHours = (duration: number) => {
        return Math.floor((duration / (1000 * 60 * 60)) % 24).toString().padStart(2, "0");
    };
    const toMinutes = (duration: number) => {
        return Math.floor((duration / 1000 / 60) % 60).toString().padStart(2, "0");
    };
    const toSeconds = (duration: number) => {
        return Math.floor((duration / 1000) % 60).toString().padStart(2, "0");
    }

    return happyHourEvent !== undefined && happyHourEvent !== null
        ?   <div className="happy-hour-timer">
                <div >
                    <ConfettiIcon/>
                    <span className="title">Happy Hour</span>
                    <ConfettiIcon/>
                </div>

                <div className="time">
                    {toHours(timeLeft)}:
                    {toMinutes(timeLeft)}:
                    {toSeconds(timeLeft)}
                </div>

                <div className="description">
                    <span>Enjoy gasless transactions</span>
                    <span style={{display: "block"}}>and save fees</span>
                </div>
               
            </div>
        : null
}

export default BiconomyTimer;