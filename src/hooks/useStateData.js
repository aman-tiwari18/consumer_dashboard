// hooks/useStateData.js
import { useState, useEffect } from "react";
import stateWithComplaintsCount from '../resources/state_with_complaints.json';

export const useStateData = () => {
    const [defaultStateData, setDefaultStateData] = useState(null);

    useEffect(() => {
        setDefaultStateData(stateWithComplaintsCount);
    }, []);

    return { defaultStateData };
};
