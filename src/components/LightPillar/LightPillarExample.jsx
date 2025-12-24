import LightPillar from "./LightPillar";

// Example usage of LightPillar component
// This can be used in your portfolio site for visual effects

function LightPillarExample() {
	return (
		<div style={{ position: "relative", width: "100%", height: "500px" }}>
			<LightPillar
				topColor="#5227FF" // Top color of the pillar (hex)
				bottomColor="#FF9FFC" // Bottom color of the pillar (hex)
				intensity={1.0} // Overall brightness (0-2)
				rotationSpeed={0.3} // Animation speed
				interactive={false} // Enable mouse interaction
				glowAmount={0.005} // Glow intensity
				pillarWidth={3.0} // Width of the pillar
				pillarHeight={0.4} // Height/stretch of the pillar
				noiseIntensity={0.5} // Grain effect intensity
				mixBlendMode="screen" // CSS blend mode
				pillarRotation={0} // Initial rotation in degrees
			/>
		</div>
	);
}

export default LightPillarExample;
