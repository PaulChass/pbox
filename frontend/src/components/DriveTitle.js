/**
 * Component for displaying the title of a drive, plus the free disk space
 * (own drive only), refreshed after every upload.
 * @param {Object} props - The component props.
 * @param {boolean} props.shared - Indicates whether the drive is shared or not.
 * @returns {JSX.Element} The rendered drive title component.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import api, { baseUrl } from '../api.js';
import { STORAGE_CHANGED_EVENT } from '../tusUpload.js';

export const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes)) return '?';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let value = bytes;
    while (value >= 1024 && i < units.length - 1) {
        value /= 1024;
        i += 1;
    }
    return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const DiskSpace = () => {
    const [space, setSpace] = useState(null);

    const fetchSpace = useCallback(async () => {
        try {
            const response = await api.get(`${baseUrl}/drive/space`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                withCredentials: true,
            });
            setSpace(response.data);
        } catch (err) {
            console.error('Error fetching disk space:', err);
            setSpace(null);
        }
    }, []);

    useEffect(() => {
        fetchSpace();
        window.addEventListener(STORAGE_CHANGED_EVENT, fetchSpace);
        return () => window.removeEventListener(STORAGE_CHANGED_EVENT, fetchSpace);
    }, [fetchSpace]);

    if (!space || !space.total) return null;
    const usedPct = (space.used / space.total) * 100;
    const variant = usedPct > 90 ? 'danger' : usedPct > 75 ? 'warning' : 'info';

    return (
        <div className="diskSpace" style={{ maxWidth: '22rem', marginBottom: '0.5rem' }}>
            <small>{formatBytes(space.free)} free of {formatBytes(space.total)}</small>
            <ProgressBar now={usedPct} variant={variant} style={{ height: '0.5rem' }} />
        </div>
    );
};

const DriveTitle = ({ shared }) => {
    return (
        <Row>
            <Col>
                <h2 className='driveTitle'>{shared ? 'Shared Drive' : 'My drive'}</h2>
                {!shared && <DiskSpace />}
            </Col>
        </Row>
    );
};

export default DriveTitle;
