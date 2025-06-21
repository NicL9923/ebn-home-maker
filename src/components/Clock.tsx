import { format } from 'date-fns';
import { useState, useEffect } from 'react';

const Clock = () => {
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const tick = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(tick);
    }, []);

    return format(currentTime, 'h:mm a');
};

export default Clock;
