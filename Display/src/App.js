import React, { useEffect, useState } from "react";
import { slideshowService } from "./services/SlideshowService";
import _ from "lodash";
import MediasPage from "./pages/MediasPage";
import { slideshowStatutsService } from "./services/SlideshowStatutsService";
import "./Global.css";
import TestPage from "./pages/TestPage";
import { settingsService } from "./services/SettingsService";
import { accidentService } from "./services/AccidentServices";
import { dataService } from "./services/DataService";
import AccidentPage from "./pages/AccidentPage";
import DataPage from "./pages/DataPage";

function App() {
    const [accident, setAccident] = useState({});
    const [isVeilleMode, setIsVeilleMode] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [currentSlideshow, setCurrentSlideshow] = useState({});
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const [pageIndex, setPageIndex] = useState(0);

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [temperature, setTemperature] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setDate(now.toLocaleDateString());
            setTime(
                now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            );
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setPageIndex((prevIndex) => 1 - prevIndex);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const [
                accidentRes,
                veilleRes,
                slideshowRes,
                slideshowStatusRes,
                dataRes,
            ] = await Promise.all([
                accidentService.getAccident(),
                settingsService.getSettings(),
                slideshowService.getSlideshow(),
                slideshowStatutsService.getSlideshowStatus(),
            ]);

            setIsVeilleMode(checkIsInVeillePeriod(veilleRes[0]));
            setAccident(accidentRes[0]);

            const currentSlideshowId = slideshowStatusRes[0]?.slideshowId;
            if (slideshowStatusRes[0]?.isRunning) {
                const foundSlideshow = slideshowRes.data.slideshows.find(
                    (slideshow) => slideshow._id === currentSlideshowId
                );

                if (!_.isEqual(currentSlideshow, foundSlideshow)) {
                    setCurrentSlideshow(foundSlideshow);
                    setCurrentMediaIndex(0);
                }
            } else if (!_.isEmpty(currentSlideshow)) {
                setCurrentSlideshow({});
            }

            if (slideshowStatusRes[0]?.isTesting) {
                setIsTesting(true);
            } else {
                setIsTesting(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [currentSlideshow]);

    useEffect(() => {
        const mediaInterval = setInterval(
            () => {
                setCurrentMediaIndex(
                    (prevIndex) => (prevIndex + 1) % (currentSlideshow.media?.length || 1)
                );
            },
            currentSlideshow.media && currentSlideshow.media.length > 0
                ? currentSlideshow.media[currentMediaIndex]?.duration * 1000
                : 5000
        );

        return () => clearInterval(mediaInterval);
    }, [currentSlideshow, currentMediaIndex]);

    const checkIsInVeillePeriod = (veilleData) => {
        console.log("veilleData", veilleData);
        if (!veilleData.enable) {
            return true;
        }
        const currentHour = new Date().getHours();
        const startHour = parseInt(veilleData.start.split(":")[0], 10);
        const stopHour = parseInt(veilleData.stop.split(":")[0], 10);

        return currentHour >= startHour && currentHour < stopHour;
    };

    useEffect(() => {
        const fetchTemperature = async () => {
            const dataRes = await dataService.getData();
            setTemperature(dataRes.data[0].temperature);
        };
        fetchTemperature();
        const interval = setInterval(fetchTemperature, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                maxHeight: `${process.env.REACT_APP_HEIGHT}px`,
                maxWidth: `${process.env.REACT_APP_WIDTH}px`,
                overflow: "hidden",
            }}
        >


            {isTesting ? (
                <TestPage />
            ) : !isVeilleMode ? (
                <></>
            ) : currentSlideshow.media && currentSlideshow.media.length > 0 ? (
                currentSlideshow.media.map((media, index) => (
                    <div
                        key={media._id}
                        style={{
                            display: index === currentMediaIndex ? "block" : "none",
                        }}
                    >
                        {media.type === "Panneau" ? (
                            <AccidentPage accident={accident} />
                        ) : media.type === "Data" ? (
                            <DataPage time={time} date={date} temperature={temperature} />
                        ) : (
                            <MediasPage media={media} />
                        )}
                    </div>
                ))
            ) : pageIndex === 0 ? (
                <AccidentPage accident={accident} />
            ) : (
                <DataPage time={time} date={date} temperature={temperature} />
            )}
        </div>
    );
}

export default App;
