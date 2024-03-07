import React, { useRef } from 'react';

const TextToSpeech = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const audioRef = useRef(null);

  const convertToSpeech = () => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = "hello how are you";
    window.speechSynthesis.speak(speech);

    // Connect the speech synthesis to the analyser node
    const source = audioContext.createMediaStreamSource(audioRef.current.captureStream());
    source.connect(analyser);

    // Start analyzing the audio
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      
      // Calculate the amplitude
      let amplitude = 0;
      for (let i = 0; i < bufferLength; i++) {
        amplitude += Math.abs((dataArray[i] - 128) / 128);
      }
      amplitude /= bufferLength;
      console.log("Amplitude:", amplitude);
    };

    draw();
  };

  return (
    <>
      <button onClick={convertToSpeech}>Convert to Speech</button>
      {/* Hidden audio element to capture speech output */}
      <audio ref={audioRef} style={{ display: 'none' }} controls />
      <button>clickme</button>
    </>
  );
};

export default TextToSpeech;
