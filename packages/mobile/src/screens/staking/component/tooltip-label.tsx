import { observer } from "mobx-react-lite";
import React, { Fragment, FunctionComponent, useState } from "react";
import {
  Image,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { CloseLargeIcon } from "../../../components/icon/outlined";
import { registerModal } from "../../../modals/base";
import { useStyle } from "../../../styles";

export const TooltipLabel: FunctionComponent<{
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  text: string;
  bottomSheetTitle?: string;
  bottomSheetContentView?: React.ReactNode;
}> = observer(
  ({
    textStyle,
    containerStyle,
    text,
    bottomSheetTitle,
    bottomSheetContentView,
  }) => {
    const style = useStyle();

    const [isOpen, setIsOpen] = useState(false);

    return (
      <Fragment>
        <View
          style={{
            ...style.flatten(["flex-row", "justify-start", "items-center"]),
            ...containerStyle,
          }}
        >
          <Text
            style={{
              ...style.flatten(["color-label-text-2", "text-small-regular"]),
              ...textStyle,
            }}
          >
            {text}
          </Text>
          {bottomSheetContentView && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setIsOpen(true);
              }}
              style={style.flatten(["margin-left-4"])}
            >
              <Image
                style={style.flatten(["width-16", "height-16"])}
                resizeMode="contain"
                source={require("../../../assets/image/icon_tooltip.png")}
              />
            </TouchableOpacity>
          )}
        </View>
        {bottomSheetContentView && (
          <BottomSheet
            isOpen={isOpen}
            close={() => {
              setIsOpen(!isOpen);
            }}
            title={bottomSheetTitle}
            contentView={bottomSheetContentView}
          />
        )}
      </Fragment>
    );
  }
);

const BottomSheet: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  title?: string;
  contentView?: React.ReactNode;
}> = registerModal(
  ({ close, title, contentView }) => {
    const style = useStyle();

    return (
      <View
        style={style.flatten([
          "background-color-background",
          "border-radius-16",
        ])}
      >
        <View
          style={style.flatten([
            "flex-row",
            "items-center",
            "height-40",
            "margin-top-8",
          ])}
        >
          <View
            style={style.flatten(["margin-x-16", "height-24", "width-24"])}
          />
          <Text
            style={style.flatten([
              "flex-1",
              "text-medium-bold",
              "color-label-text-1",
              "text-center",
            ])}
          >
            {title}
          </Text>
          <TouchableOpacity
            onPress={close}
            style={style.flatten(["margin-x-16"])}
          >
            <CloseLargeIcon color={style.get("color-white").color} />
          </TouchableOpacity>
        </View>
        {contentView}
      </View>
    );
  },
  {
    disableSafeArea: true,
  }
);
