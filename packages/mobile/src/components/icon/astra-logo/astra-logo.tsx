import React, { FunctionComponent } from "react";
import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

export const AstraLogo: FunctionComponent = () => {
  return (
    <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <Path
        d="M0 16C0 10.0185 0 7.02769 1.28616 4.8C2.12873 3.34062 3.34062 2.12873 4.8 1.28616C7.02769 0 10.0185 0 16 0C21.9815 0 24.9723 0 27.2 1.28616C28.6594 2.12873 29.8713 3.34062 30.7138 4.8C32 7.02769 32 10.0185 32 16C32 21.9815 32 24.9723 30.7138 27.2C29.8713 28.6594 28.6594 29.8713 27.2 30.7138C24.9723 32 21.9815 32 16 32C10.0185 32 7.02769 32 4.8 30.7138C3.34062 29.8713 2.12873 28.6594 1.28616 27.2C0 24.9723 0 21.9815 0 16Z"
        fill="url(#paint0_linear_7406_147244)"
      />
      <G clipPath="url(#clip0_7406_147244)">
        <Path
          d="M17.7566 14.818H19.6803L15.9988 5.60001L12.3172 14.818H14.4532C14.7096 14.818 14.9402 14.6617 15.0354 14.4233L15.9988 12.0112L16.8833 14.2259C17.0261 14.5835 17.372 14.818 17.7566 14.818Z"
          fill="white"
        />
        <Path
          d="M19.3526 20.4086L15.9988 18.4262L12.6449 20.4086L13.7511 17.639C13.865 17.3538 13.7562 17.028 13.4939 16.8688L11.8876 15.8935L7.84766 26.0089L15.9988 21.191L24.1499 26.0089L20.1099 15.8935L18.5036 16.8688C18.2414 17.028 18.1326 17.3538 18.2465 17.639L19.3526 20.4086Z"
          fill="white"
        />
      </G>
      <Defs>
        <LinearGradient
          id="paint0_linear_7406_147244"
          x1="12.6996"
          y1="-3.17452"
          x2="-2.35218"
          y2="19.1406"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#5132FF" />
          <Stop offset="0.2703" stopColor="#5232FD" />
          <Stop offset="0.4139" stopColor="#5831F5" />
          <Stop offset="0.5277" stopColor="#6030E7" />
          <Stop offset="0.6259" stopColor="#6D2FD4" />
          <Stop offset="0.714" stopColor="#7D2DBB" />
          <Stop offset="0.795" stopColor="#912B9C" />
          <Stop offset="0.8704" stopColor="#A82878" />
          <Stop offset="0.9395" stopColor="#C3254F" />
          <Stop offset="1" stopColor="#DE2224" />
        </LinearGradient>
        <ClipPath id="clip0_7406_147244">
          <Rect
            width="16.3022"
            height="20.4089"
            fill="white"
            transform="translate(7.84766 5.60001)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
