

import React, { useState, useEffect, useRef } from 'react';

function Audio() {
  const [audioContext, setAudioContext] = useState(null);
  const [frequencyData, setFrequencyData] = useState([]);
  const audioRef = useRef(null);

  let handleAudioStart = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);
  };

  useEffect(() => {
 console.log("1");
    if (!audioContext) return;

    const audioElement = document.getElementsByTagName('audio')[0];
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
      requestAnimationFrame(updateFrequencyData);
    };

    updateFrequencyData();
  

    return () => {
      audioContext.close();
    };
  }, [audioContext]);
 

  let data =frequencyData.map((value, index) => (value))
 data=data[0];
 data =data/1000

  console.log(data);
//   data=data.charAt(1);
useEffect(() => {
    console.log("2");
  
  }, []);
  useEffect(() => {   
    const options = {
      method: 'POST',
      headers: {
        'xi-api-key': '96cf8275f379c6995786ec0bf6515102',
        'Content-Type': 'application/json'
      },
      body: '{"model_id":"eleven_monolingual_v1","text":"Hello how are you? I am testing this speech to text here.","voice_settings":{"similarity_boost":1,"stability":1}}'
    };
    
    fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', options)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
    console.log(audioUrl);
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = audioUrl;
        })
        .catch(err => console.error(err));
        // handleAudioStart();
        // audioRef.current.play();
  }, []);

 
 
  return (
    <div >
      <button onClick={handleAudioStart}>Start Audio</button>
      {/* <audio ref={audioRef} controls onClick={handleAudioStart}>
        <source src="./Billo.mp3" type="audio/mpeg"/> 
        Your browser does not support the audio element.
      </audio> */}
      <audio ref={audioRef} controls id="audioPlayer">
        Your browser does not support the audio element.
    </audio>
      <div>
        {frequencyData.map((value, index) => (
          <div key={index}>{value}</div>
        ))}
      </div>
    </div>
  );
}

export default Audio;
