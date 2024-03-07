import * as THREE from "three";
import React, { useRef, Suspense, useState, useEffect } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";

const Shaderboxresp = ({ audiourl }) => {
  console.log(audiourl);
  const [contextLost, setContextLost] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [frequencyData, setFrequencyData] = useState([]);
 
  // const [texttext, settexttext] = useState("hello i am fine");
  const audioRef = useRef(null);

  let handleAudioStart = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);
    
  };
console.log("audio",audioContext);
  useEffect(() => {
    console.log("1");
    if (!audioContext) return;

    const audioElement = document.getElementsByTagName("audio")[0];
    const audioSrc = audioContext.createMediaElementSource(audioElement);
    const analyser = audioContext.createAnalyser();

    audioSrc.connect(analyser);
    audioSrc.connect(audioContext.destination);
    

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateFrequencyData = () => {
      analyser.getByteFrequencyData(dataArray);
      setFrequencyData([...dataArray]); // Copy the array to trigger re-render
       // Calculate a value based on frequency data
     // Calculate a value based on frequency data
    
      requestAnimationFrame(updateFrequencyData);
    };

    updateFrequencyData();

    return () => {
      audioContext.close();
    };
  }, [audioContext]);

  let data = frequencyData.map((value, index) => value);
  data = data[0];
  data = (data / 1000) * 6;

  console.log(data);

  //   data=data.charAt(1);
  useEffect(() => {
    // handleAudioStart()
    console.log("2");
    //  const audioPlayer = document.getElementById('audioPlayer');
    //             audioPlayer.src = audiourl;
  }, []);

  // console.log("out",data);
  // Shader Material
  const WaveShaderMaterial = shaderMaterial(
    {
      uTime: 0,
      uColor: new THREE.Color(0.0, 0.0, 0.0),
      data: data,
    },
    // Vertex Shader
    glsl`
      precision mediump float;
      varying vec2 vUv;
      varying float vWave;
      uniform float uTime;
      uniform float data;
      #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);
      void main() {
        vUv = uv;
        vec3 pos = position;
        float noiseFreq = 3.0;
        float noiseAmp = data;
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
        float wave = vWave * 0.9;
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
        <icosahedronGeometry args={[0.4, 8, 8]} />
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
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      audioRef.current.src = objectUrl;
    }
  };
  return (
    <>
      <div>
      <input type="file" onChange={handleFileChange} />
        <button onClick={handleAudioStart}>Start Audio</button>
        <audio ref={audioRef} controls onClick={handleAudioStart}>
          {/* static audi file */}
          <source src="" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
       
        {/* dynamic audio file */}
        {/* <audio ref={audioRef} controls id="audioPlayer">
        Your browser does not support the audio element.
    </audio> */}
        {/* <div>
        {frequencyData.map((value, index) => (
          <div key={index}>{value}</div>
        ))}
      </div> */}
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
        <div className="voice-btn">
            <div className="start-button">
              <button className={`start-btn `} >
                <i
                  className="fas fa-play"
                  style={{
                    fontSize: "15px",
                    color: "white",
                    border: "4px solid white",
                    padding: "9px",
                    borderRadius: "50%",
                    paddingLeft: "11px",
                    paddingRight: "11px",
                    paddingTop: "11px",
                    cursor: "pointer",
                  }}
                ></i>
              </button>
            </div>
            <div>
              <h2 style={{ color: "#BDB9BD" }}>Tap to interrupt</h2>
              <button className="stop-btn"  >
                <i
                  className="fas fa-times "
                  style={{
                    fontSize: "30px",
                    color: "white",
                    borderRadius: "50%",
                    backgroundColor: "rgb(255, 113, 107)",
                    cursor: "pointer",
                  }}
                ></i>
              </button>
            </div>
          </div>
    </>
  );
};

export default Shaderboxresp;
