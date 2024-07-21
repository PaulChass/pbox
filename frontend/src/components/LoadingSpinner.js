/**
 * Represents a loading spinner component.
 * @component
 */
import React from 'react';
import { Spinner } from 'react-bootstrap'; // Assuming you're using React Bootstrap

const LoadingSpinner = () => (
	<Spinner animation="border" role="status">
		<span className="visually-hidden">Loading...</span>
	</Spinner>
);

export default LoadingSpinner;