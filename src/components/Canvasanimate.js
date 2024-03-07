import { Canvas } from "@react-three/fiber";
import React from "react";
import AudioVisualiser from "./AudioVisualiser";

function Canvasanimate() {
  return (
    <Canvas style={{ width: "100%", height: "650px" }}>
      <ambientLight intensity={1000 / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={313}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={313} />
      <AudioVisualiser position={[0.1, 0, 0]} />
    </Canvas>
  );
}

export default Canvasanimate;
