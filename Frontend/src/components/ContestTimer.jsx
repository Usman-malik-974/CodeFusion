import { useState, useEffect } from "react";
import { getContestTime } from "../shared/networking/api/contestApi/getContestTime";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import socket from "../shared/soket";
import { submitContest } from "../shared/networking/api/contestApi/submitContest";
const ContestTimer = ({ id }) => {
    // console.log(id);
    const [timeLeft, setTimeLeft] = useState(0);
    const [displayTime, setDisplayTime] = useState("");
    useEffect(() => {
        console.log("Socket connected?", socket.connected);
    }, []);

    useEffect(() => {
        const handler = ({ contestId: updatedId, addedSeconds }) => {
            if (updatedId === id) { // only update if it's for this contest
                console.log("Added ",addedSeconds);
                setTimeLeft(prev => prev + addedSeconds);
            }
        };

        const endHandler = ({ contestId: endedId }) => {
            if (endedId === id) {
                setTimeLeft(0);
            }
        }

        socket.on("contest-ended", endHandler)

        socket.on("contest-time-increased", handler);

        return () => {
            socket.off("contest-time-increased", handler);
            socket.off("contest-ended", endHandler)
        };
    }, [id]);


    const navigate = useNavigate();
    // useEffect(() => {
    //     if (!id) return;
    //     let interval;
    //     async function getRemainingTime() {
    //         const res = await getContestTime(id);
    //         if (res.error) {
    //             toast.error(res.error);
    //             // console.log(res.error);
    //             navigate(-1);
    //             return;
    //         }
    //         console.log("Time from backend", res);
    //         setTimeLeft(res.remainingTime);
    //         interval = setInterval(() => {
    //             setTimeLeft(prev => {
    //                 if (prev <= 1) {
    //                     handleSubmit();
    //                     clearInterval(interval);
    //                     return 0;
    //                 }
    //                 return prev - 1;
    //             });
    //         }, 950);
    //     }

    //     getRemainingTime();

    //     return () => clearInterval(interval);
    // }, [id]);
    useEffect(() => {
        if (!id) return;

        let interval;
        let endTime;

        async function getRemainingTime() {
            const res = await getContestTime(id);
            if (res.error) {
                toast.error(res.error);
                navigate(-1);
                return;
            }

            // Compute absolute end timestamp
            endTime = Date.now() + res.remainingTime * 1000;

            interval = setInterval(() => {
                const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
                setTimeLeft(diff);

                if (diff <= 0) {
                    handleSubmit();
                    clearInterval(interval);
                }
            }, 250); // small interval for smooth updates
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

    const handleSubmit = async () => {
        const res = await submitContest(id);
        if (res.error) {
            toast.error(res.error);
            return;
        }
        toast.success(res.message);
        navigate("/feedback");
    }


    return (
        <div className="absolute top-0 bg-blue-200 text-blue-500 font-semibold px-4 py-2 rounded-b-lg">
            {/* <div
            className="px-4 py-2 bg-blue-200 text-blue-500 font-semibold rounded-b-lg shadow-sm text-sm
                 flex items-center justify-center"
            style={{ minWidth: "100px" }} // optional for consistent width
        > */}
            <p>{displayTime}</p>
        </div>
    )
}

export default ContestTimer;


