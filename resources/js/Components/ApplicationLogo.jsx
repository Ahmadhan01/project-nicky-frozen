import { useState, useEffect } from "react";

export default function ApplicationLogo(props) {
    const [isLight, setIsLight] = useState(false);
    useEffect(() => {
        setIsLight(document.documentElement.classList.contains("light"));
    }, []);

    return (
        <img
            {...props}
            src={isLight ? "/niki_fullblack_v2.png" : "/niki_fullwhite_v2.png"}
            alt="Nicky Frozen"
        />
    );
}
