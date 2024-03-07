import React from "react";
import { Puff } from "react-loader-spinner";

function Loader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "black",
      }}
    >
      <div style={{ backgroundColor: "black" }}>
        <Puff
          visible={true}
          height={40}
          width={40}
          color="white"
          ariaLabel="puff-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
      <p style={{ color: "#fff", marginLeft: 10 }}>Please wait...</p>
    </div>
  );
}

export default Loader;
