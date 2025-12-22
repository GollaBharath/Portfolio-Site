import "./App.css";
import Terminal from "./components/Terminal/Terminal";
import PixelBlast from "./components/PixelBlast-background/PixelBlast";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";

function App() {
	return (
		<div className="app-container">
			<PixelBlast
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					zIndex: 0,
				}}
				variant="square"
				color="#970505"
				pixelSize={2}
				patternScale={1.9}
				patternDensity={1.5}
				enableRipples={true}
				rippleIntensityScale={2}
				rippleSpeed={4}
				edgeFade={0.5}
				transparent={false}
				liquid={true}
			/>
			<div className="app-content">
				<Navbar />
				<Hero />
				<Terminal />
			</div>
		</div>
	);
}

export default App;
