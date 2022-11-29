import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";
import { useStyle } from "../../styles";

export const ScanIcon: FunctionComponent<{
  color?: string;
  size: number;
}> = ({ color, size }) => {
  const style = useStyle();
  color = color ?? style.get("color-icon-default").color;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 3C3.89543 3 3 3.89543 3 5V8C3 8.55228 3.44772 9 4 9C4.55228 9 5 8.55228 5 8V5H8C8.55228 5 9 4.55228 9 4C9 3.44772 8.55228 3 8 3H5Z"
        fill={color}
      />
      <Path
        d="M16 3C15.4477 3 15 3.44772 15 4C15 4.55228 15.4477 5 16 5H19V8C19 8.55228 19.4477 9 20 9C20.5523 9 21 8.55228 21 8V5C21 3.89543 20.1046 3 19 3H16Z"
        fill={color}
      />
      <Path
        d="M5 16C5 15.4477 4.55228 15 4 15C3.44772 15 3 15.4477 3 16V19C3 20.1046 3.89543 21 5 21H8C8.55228 21 9 20.5523 9 20C9 19.4477 8.55228 19 8 19H5V16Z"
        fill={color}
      />
      <Path
        d="M21 16C21 15.4477 20.5523 15 20 15C19.4477 15 19 15.4477 19 16V19H16C15.4477 19 15 19.4477 15 20C15 20.5523 15.4477 21 16 21H19C20.1046 21 21 20.1046 21 19V16Z"
        fill={color}
      />
      <Path
        d="M21 13C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11H3C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13H21Z"
        fill={color}
      />
    </Svg>
  );
};
