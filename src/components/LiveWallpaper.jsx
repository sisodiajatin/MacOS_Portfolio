import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

const LiveWallpaper = ({ darkMode }) => {
    return (
        <div className="live-wallpaper">
            <ShaderGradientCanvas
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                }}
                pixelDensity={1}
                pointerEvents="none"
            >
                <ShaderGradient
                    animate="on"
                    type="sphere"
                    wireframe={false}
                    shader="defaults"
                    uTime={0}
                    uSpeed={0.3}
                    uStrength={0.3}
                    uDensity={0.8}
                    uFrequency={5.5}
                    uAmplitude={3.2}
                    positionX={-0.1}
                    positionY={0}
                    positionZ={0}
                    rotationX={0}
                    rotationY={130}
                    rotationZ={70}
                    color1={darkMode ? "#1a1a2e" : "#73bfc4"}
                    color2={darkMode ? "#4a148c" : "#ff810a"}
                    color3={darkMode ? "#0d0d1a" : "#8da0ce"}
                    reflection={0.4}
                    cAzimuthAngle={270}
                    cPolarAngle={180}
                    cDistance={0.5}
                    cameraZoom={15.1}
                    lightType="env"
                    brightness={darkMode ? 0.5 : 0.8}
                    envPreset="city"
                    grain="on"
                    toggleAxis={false}
                    zoomOut={false}
                    hoverState=""
                    enableTransition={false}
                />
            </ShaderGradientCanvas>
        </div>
    );
};

export default LiveWallpaper;
