import * as THREE from "three";
import React, { useRef, Suspense, useState, useEffect } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";

const Shaderbox = () => {
  //  console.log(animationActive);
  const [amplitude, setAmplitude] = useState(0.0);
  const [contextLost, setContextLost] = useState(false);
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);

        // Set up the analyser node to get amplitude data
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        // console.log(dataArray);
        const updateAmplitude = () => {
          analyser.getByteTimeDomainData(dataArray);
          // Calculate the average amplitude
          const sum = dataArray.reduce((acc, val) => acc + val, 0);
          const avgAmplitude = sum / bufferLength;
          // Map the amplitude directly to the range of 0 to 0.5
          // let scaledAmplitude = avgAmplitude / 256 * 0.2;
          setAmplitude(avgAmplitude);

          setAmplitude(avgAmplitude);

          requestAnimationFrame(updateAmplitude);

          let numberAsString = avgAmplitude.toString().charAt(2);
          numberAsString = numberAsString - 7;
          numberAsString = numberAsString / 10;
          setAmplitude(numberAsString);
          // console.log("amp",amplitude);
          // console.log("ampl", avgAmplitude);
        };

        updateAmplitude();
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  }, []);
  // console.log("our voice",amplitude);
  // Shader Material
  const WaveShaderMaterial = shaderMaterial(
    {
      uTime: 0,
      uColor: new THREE.Color(0.0, 0.0, 0.0),
      amplitude: amplitude,
    },
    // Vertex Shader
    glsl`
      precision mediump float;
      varying vec2 vUv;
      varying float vWave;
      uniform float uTime;
      // uniform float transcript1;
      uniform float amplitude;
      #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);
      void main() {
        vUv = uv;
        vec3 pos = position;
        float noiseFreq = 8.0;
        float noiseAmp = amplitude;
        vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y * noiseFreq + uTime, pos.z);
        pos.z += snoise3(noisePos) * noiseAmp;
        vWave = pos.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    // Fragment Shader
    glsl`
      precision mediump float;
      uniform vec3 uColor;
      uniform float uTime;
      varying vec2 vUv;
      varying float vWave;
      void main() {
        float wave = vWave * 0.2;
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `
  );

  extend({ WaveShaderMaterial });

  const Wave = () => {
    const ref = useRef();

    useFrame(({ clock }) => {
      ref.current.uTime = clock.getElapsedTime();
    });

    return (
      <mesh>
        <icosahedronGeometry args={[0.5, 16, 16]} />
        <waveShaderMaterial
          color="white"
          uColor={"white"}
          ref={ref}
          wireframe={true}
        />
      </mesh>
    );
  };

  useEffect(() => {
    const onContextLost = () => {
      setContextLost(true);
    };

    const onContextRestored = () => {
      setContextLost(false);
      // You may need to reset your scene or resources here
    };

    window.addEventListener("webglcontextlost", onContextLost, false);
    window.addEventListener("webglcontextrestored", onContextRestored, false);

    return () => {
      window.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, []);

  return (
    <>
      <div>
        {/* <p style={{ color: "white" }}>Amplitude: {amplitude}</p> */}
        {/* Visualize amplitude if needed */}
      </div>
      {contextLost ? (
        <div>WebGL context lost. Please refresh the page.</div>
      ) : (
        <Canvas
          style={{ height: "600px", width: "100%" }}
          camera={{ fov: 14, position: [0, 0, 5] }}
        >
          <Suspense fallback={null}>
            <Wave />
          </Suspense>
        </Canvas>
      )}
    </>
  );
};

export default Shaderbox;
