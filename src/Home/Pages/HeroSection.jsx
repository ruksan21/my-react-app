import React from 'react';
import HeroImage from '../../Image/Home.png';

// Reusable hero section component.
// Displays ward chairperson heading and currently selected municipality/ward.
// Props:
// - selectedMuni: string to show current selection (defaults to placeholder)
const HeroSection = ({ selectedMuni = 'Select Municipality' }) => {
	return (
		<section className="hero">
			<img src={HeroImage} alt="Hero" />
			<div className="hero-overlay">
				<h1>Ward Chairperson</h1>
				<p>View your Ward Chairperson details</p>
				<div className="selected-muni">{selectedMuni}</div>
			</div>
		</section>
	);
};

export default HeroSection;
