import { useState,useEffect } from "react";
import { getContestTime } from "../shared/networking/api/contestApi/getContestTime";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const ContestTimer = ({id}) => {
    // console.log(id);
    const [timeLeft, setTimeLeft] = useState(0);
    const [displayTime, setDisplayTime] = useState("");
    const navigate=useNavigate();
    useEffect(() => {
        if (!id) return;
        let interval;
        async function getRemainingTime() {
            const res = await getContestTime(id);
            if (res.error) {
                toast.error(res.error);
                // console.log(res.error);
                navigate(-1);
                return;
            }
            console.log("Time from backend", res);
            setTimeLeft(res.remainingTime);
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmit();
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        getRemainingTime();

        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        setDisplayTime(
            `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`
        );
    }, [timeLeft]);


    return (
        <div className="absolute top-0 bg-blue-200 text-blue-500 font-semibold px-4 py-2 rounded-b-lg">
            <p>{displayTime}</p>
        </div>
    )
}

export default ContestTimer;