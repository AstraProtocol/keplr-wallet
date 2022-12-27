import React, { FunctionComponent } from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useStyle } from "../../styles";

export const RightArrowIcon: FunctionComponent<{
  color?: string;
  height: number;
}> = ({ color, height }) => {
  const style = useStyle();
  color = color ?? style.get("color-icon-default").color;

  return (
    <Svg
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      clipRule="evenodd"
      viewBox="0 0 8 14"
      style={{
        height,
        aspectRatio: 8 / 14,
      }}
    >
      <Path
        fill="none"
        fillRule="nonzero"
        stroke={color}
        strokeWidth="2"
        d="M1.188 1.375L6.813 7l-5.625 5.625"
        transform="translate(-.139 -.243) scale(1.03469)"
      />
    </Svg>
  );
};

export const DoubleRightArrowIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      viewBox="0 0 18 19"
      style={{
        height,
        aspectRatio: 18 / 19,
      }}
    >
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8.833 1.833l7.875 7.875-7.875 7.875"
      />
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M1.833 1.833l7.875 7.875-7.875 7.875"
      />
    </Svg>
  );
};

export const BottomArrowIcon: FunctionComponent<{
  color?: string;
  size?: number;
  containerStyle?: ViewStyle;
}> = ({ color, size = 24, containerStyle }) => {
  const style = useStyle();
  color = color ?? style.get("color-icon-default").color;

  return (
    <View style={containerStyle}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};
