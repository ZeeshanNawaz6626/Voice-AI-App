import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

function AudioVisualiser(props) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  //   rotation
  useFrame((state, delta) => (meshRef.current.rotation.y += 0.2 * delta));
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 5 : 5}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <icosahedronGeometry args={[0.5, 14, 14]} />
      <meshStandardMaterial
        color={hovered ? "white" : "white"}
        wireframe={true}
      />
    </mesh>
  );
}

export default AudioVisualiser;
