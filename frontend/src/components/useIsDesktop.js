/**
 * Custom hook to determine if the current device is a desktop.
 *
 * @returns {boolean} Returns true if the current device is a desktop, otherwise false.
 */
import { useState, useEffect } from 'react';

const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkIfDesktop = () => {
            setIsDesktop(window.innerWidth > 1024);
        };
        checkIfDesktop();
        window.addEventListener('resize', checkIfDesktop);
        return () => window.removeEventListener('resize', checkIfDesktop);
    }, []);

    return isDesktop;
};

export default useIsDesktop;