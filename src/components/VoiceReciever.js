import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import Loader from "./Loader";
import Shaderbox from "./Shaderbox";
import Canvasanimate from "./Canvasanimate";
import Shaderboxresp from "./Shaderboxresp";
import Audio from "./Audio";
function VoicReciever() {
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState({});
  const [text, setText] = useState();
  const [speaking, setSpeaking] = useState(false);
  const [animationActive, setAnimationActive] = useState(false);
  const [firstrender, setFirstrender] = useState(false);
  const [audiourl, setAudiourl] = useState();
  const synthRef = useRef(window.speechSynthesis);

  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    // console.log("1");
    async function fetchData() {
      try {
        const response = await axios.get(
          "https://chatgptspeech.coderzinn.com/wp-json/custom/v1/openai-settings"
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const ChatAi = async () => {
    await SpeechRecognition.startListening();
  };
  // const speakLongText = (text) => {
  //   const maxLength = 200; // Maximum length of each chunk
  //   const chunks = [];
  //   for (let i = 0; i < text.length; i += maxLength) {
  //     chunks.push(text.substring(i, i + maxLength));
  //   }
  //   chunks.forEach((chunk, index) => {
  //     const utterance = new SpeechSynthesisUtterance(chunk);
  //     console.log("chatgpt response",utterance.pitch);
  //     utterance.rate = 1.0; // Adjust rate if needed
  //     utterance.pitch = 1.0; // Adjust pitch if needed
  //     if (index === chunks.length - 1) {
  //       // If it's the last chunk, set onend handler
  //       utterance.onend = () => {
  //         setSpeaking(false);
  //         setAnimationActive(false);
  //         resetTranscript();
  //       };
  //     }
  //     const synth = window.speechSynthesis;

  //     synth.speak(utterance);
  //   });
  //   setSpeaking(true);
  //   setAnimationActive(true);
  // };

  // const speak = () => {
  //   console.log("speak");
  //   speakLongText(text);
  // };

  //   if (!listening && transcript.trim() !== "") {
  // console.log(transcript);}

  // useEffect to capture transcript value when listening stops
  useEffect(() => {
    // console.log("2");
    // setText();
    const fetchData = async () => {
      if (!listening && transcript.trim() !== "") {
        setLoader(true);
        // console.log("setloader");
        try {
          const params = {
            max_tokens: parseInt(data.max_tokens),
            model: data.model,
            temperature: parseInt(data.temperature),
            messages: [{ role: "user", content: transcript }],
          };

          const response = await axios.post(data.chat_endPoint, params, {
            headers: { Authorization: `Bearer ${data.api_key}` },
          });
          setLoader(false);
          const chatResponse = response.data.choices;
          const responseData = chatResponse[0].message.content;
          // console.log(responseData);
          setText(responseData);
          // console.log("restext",text);
        } catch (error) {
          console.error("Error:", error);
        }
      }
    };
    fetchData();
  }, [transcript, listening]);
  // console.log(listening);
  // useEffect(() => {
  //   // console.log("3");
  //   if (firstrender) {
  //     speak();
  //     setText("");
  //   } else {
  //     setFirstrender(true);
  //   }
  // }, [text]);
  // console.log("res",text);
  useEffect(() => {
    const fetchData = async () => {
        if (text) {
            const options = {
                method: 'POST',
                headers: {
                    'xi-api-key': 'f16c1596e10552bb5b70cf0caf662533',
                    'Content-Type': 'application/json'
                },
                body: `{"model_id":"eleven_monolingual_v1","text":"${text}" ,"voice_settings":{"similarity_boost":1,"stability":1}}`
            };

            try {
                const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', options);
                const arrayBuffer = await response.arrayBuffer();
                const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(blob);
                // console.log("audiourl", audioUrl);
                setAudiourl(audioUrl)
               
            } catch (err) {
                console.error(err);
            }
        }
    };

    fetchData();
}, [text]);
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }
  const stop = () => {
    const synth = synthRef.current;
    synth.cancel();
    setSpeaking(false);
    setAnimationActive(false); // Stop animation when speaking stops
    resetTranscript();
  };
  // console.log(listening);




  return (
    <>
    
      {loader ? (
        <Loader />
      ) : (
        <div id="threejs-container ">
          {audiourl ? (
            <Shaderboxresp audiourl={audiourl} />
          ) : listening ? (
            <Shaderbox />
          ) : (
            <Canvasanimate />
          )}
          <div className="voice-btn">
            <div className="start-button">
              <button className={`start-btn `} onClick={ChatAi}>
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
              <button className="stop-btn" onClick={stop} disabled={!speaking}>
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
        </div>
      )}
    </>
  );
}

export default VoicReciever;
