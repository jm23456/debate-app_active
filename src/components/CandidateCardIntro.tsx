import React from "react";
import yellowStandard from "./yellow_standard.jpg";
import redStandard from "./red_standard.jpg";
import greenStandard from "./green_standard.jpg";
import greyStandard from "./grey_standard.jpg";
import blueStandard from "./blue_standard.jpg";

interface CandidateCardIntroProps {
  color: "yellow" | "gray" | "red" | "green" | "blue";
}

const CandidateCardIntro: React.FC<CandidateCardIntroProps> = ({ color }) => {
  const getImage = () => {
    switch (color) {
      case "yellow":
        return yellowStandard;
      case "red":
        return redStandard;
      case "green":
        return greenStandard;
      case "gray":
        return greyStandard;
      case "blue":
        return blueStandard;
    }
  };

  return (
    <div className={`candidate-card candidate-${color}`}>
      <div className={`candidate-robot`}>
        <img src={getImage()} alt={`${color} robot`} className="robot-image" />
      </div>
    </div>
  );
};

export default CandidateCardIntro;