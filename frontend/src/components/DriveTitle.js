/**
 * Component for displaying the title of a drive.
 * @param {Object} props - The component props.
 * @param {boolean} props.shared - Indicates whether the drive is shared or not.
 * @returns {JSX.Element} The rendered drive title component.
 */
import React from 'react';
import { Row, Col } from 'react-bootstrap';

const DriveTitle = ({ shared }) => {
    return (
        <Row>
            <Col>
                <h2 className='driveTitle'>{shared ? 'Shared Drive' : 'My drive'}</h2>
            </Col>
        </Row>
    );
};

export default DriveTitle;