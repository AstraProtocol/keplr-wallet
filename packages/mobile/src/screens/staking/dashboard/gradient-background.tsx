import React, { FunctionComponent } from "react";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

export const GradientBackground: FunctionComponent<{
  width: number;
  height: number;
}> = ({ width = 10, height = 10 }) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="url(#paint0_linear_115_91)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_115_91"
          x1="100%"
          y1="50%"
          x2="0%"
          y2="50%"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="-0.1428" stopColor="#5132FF" />
          <Stop offset="0.1404" stopColor="#5232FD" />
          <Stop offset="0.2808" stopColor="#5831F5" />
          <Stop offset="0.41" stopColor="#6030E7" />
          <Stop offset="0.5129" stopColor="#6D2FD4" />
          <Stop offset="0.6052" stopColor="#7D2DBB" />
          <Stop offset="0.69" stopColor="#912B9C" />
          <Stop offset="0.769" stopColor="#A82878" />
          <Stop offset="0.8414" stopColor="#C3254F" />
          <Stop offset="0.9048" stopColor="#DE2224" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};
