import React, { FunctionComponent, useEffect, useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useStyle } from "../../../styles";

export const CustomTabBar: FunctionComponent<{
  data: { title?: string }[];
  defaultSelectedIndex?: number;
  containerStyle?: ViewStyle;
  onIndexChanged?: (index: number) => void;
}> = ({ data, defaultSelectedIndex = 0, containerStyle, onIndexChanged }) => {
  const style = useStyle();

  const [selectedIndex, setSelectedIndex] = useState(defaultSelectedIndex);

  useEffect(() => {
    if (typeof onIndexChanged === "function") {
      onIndexChanged(selectedIndex);
    }
  }, [selectedIndex]);

  const tabItem = (
    item: { title?: string },
    index: number,
    isSelected: boolean
  ) => {
    return (
      <View
        style={style.flatten(
          ["flex-1", "justify-center", "border-width-bottom-1"],
          [isSelected ? "border-color-link-text" : "border-color-transparent"]
        )}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={style.flatten(["width-full", "height-full", "justify-center"])}
          onPress={() => {
            setSelectedIndex(index);
          }}
        >
          <Text
            style={style.flatten(
              ["text-center"],
              [
                isSelected ? "text-base-bold" : "text-base-regular",
                isSelected ? "color-link-text" : "color-label-text-2",
              ]
            )}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  const tabItems = () => {
    return data.map((item, index) =>
      tabItem(item, index, selectedIndex === index)
    );
  };

  return (
    <View
      style={{
        ...style.flatten([
          "flex-row",
          "height-44",
          "items-stretch",
          "border-color-card-separator",
          "border-width-bottom-1",
        ]),
        ...containerStyle,
      }}
    >
      {tabItems()}
    </View>
  );
};
