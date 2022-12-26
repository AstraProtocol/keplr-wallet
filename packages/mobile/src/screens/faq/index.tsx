import React, { FunctionComponent, useState } from "react";
import { useIntl } from "react-intl";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomNavigationBar } from "../../components/navigation-bar/custom-navigation-bar";
import { useStyle } from "../../styles";
import { DropDownIcon } from "./icon-dropdown";

export const FAQScreen: FunctionComponent = () => {
  const style = useStyle();
  const intl = useIntl();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={style.flatten(["flex-1", "background-color-background"])}>
      <CustomNavigationBar
        title={intl.formatMessage({ id: "FAQ" })}
        containerStyle={{
          ...style.flatten(["background-color-background"]),
          marginTop: safeAreaInsets.top,
        }}
      />

      <FlatList
        data={Array(8)}
        keyExtractor={(index) => `item_${index}`}
        renderItem={({ index }) => {
          const content = {
            title: intl.formatMessage({ id: `FAQ.Title.${index + 1}` }),
            desc: intl.formatMessage({ id: `FAQ.Desc.${index + 1}` }),
          };

          return (
            <FAQItem
              content={content}
              containerStyle={style.flatten(["margin-x-16", "margin-top-2"])}
            />
          );
        }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: safeAreaInsets.bottom + 16,
        }}
      />
    </View>
  );
};

const FAQItem: FunctionComponent<{
  content: { title: string; desc: string };
  containerStyle?: ViewStyle;
}> = ({ content, containerStyle }) => {
  const style = useStyle();

  const { title, desc } = content;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        ...style.flatten([
          "flex-1",
          "background-color-card-background",
          "border-radius-12",
          "padding-16",
        ]),
        ...containerStyle,
      }}
      onPress={() => {
        setIsExpanded(!isExpanded);
      }}
    >
      <View style={style.flatten(["flex-row", "items-start"])}>
        <Text
          style={style.flatten([
            "flex-1",
            "color-label-text-1",
            "text-base-medium",
          ])}
        >
          {title}
        </Text>
        <DropDownIcon isExpanded={isExpanded} />
      </View>
      {isExpanded && (
        <Text
          style={style.flatten([
            "color-label-text-2",
            "text-base-regular",
            "margin-top-8",
          ])}
        >
          {desc}
        </Text>
      )}
    </TouchableOpacity>
  );
};
