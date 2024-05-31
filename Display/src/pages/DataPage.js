import React, { useEffect, useState } from "react";

function DataPage(props) {

  const flexContainer = {
    fontSize: "70px",
    marginTop: "20px",
    height: "100%",
    width: `${process.env.REACT_APP_WIDTH}px`,
  };

  const flexItem = {
    alignItems: "center",
    marginBottom: "30px",
    textAlign: "left",
    marginLeft: "2px",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  };

  const dataStyle = {

  };

  const timeTempStyle = {
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-around",
    width: "100%",
  };

  return (
    <div style={flexContainer}>
      <div style={flexItem}>
        <div style={dataStyle}>21/05/2024</div>
        <div style={timeTempStyle}>
          <div>11:00</div>
          <div>20°C</div>
        </div>
      </div>
    </div>
  );
}

export default DataPage;