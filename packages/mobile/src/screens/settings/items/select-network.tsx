import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { useStore } from "../../../stores";
import { BottomSheet } from "../../../components/input";
import { AccountItem } from "../components";
import { Text } from "react-native";
import { useStyle } from "../../../styles";
import { AllIcon, NetworkIcon } from "../../../components/icon";
import { useIntl } from "react-intl";
export const AccountNetworkItem: FunctionComponent<{
  accountItemProps?: object
}> = observer(({ accountItemProps }) => {
    const { chainStore } = useStore();
  
    const intl = useIntl();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const chainIds =  chainStore.chainInfosInUI.map(
        (chainInfo) => {
            return {
                key: chainInfo.chainId,
                label: chainInfo.chainName,
              };
        }
      )
    return (
      <React.Fragment>
        <BottomSheet
          label={intl.formatMessage({ id: "settings.network" })}
          isOpen={isOpenModal}
          close={() => setIsOpenModal(false)}
          maxItemsToShow={4}
          selectedKey={chainStore.current.chainId}
          setSelectedKey={(key) => key && chainStore.selectChain(key)}
          items={chainIds}
        />
        <AccountItem
            {...accountItemProps}
            label={intl.formatMessage({ id: "settings.network" })}
            left={<NetworkIcon/>}
            right={
                <RightView paragraph={chainStore.current.chainName.toUpperCase()} />
            }
            onPress={() => {
                setIsOpenModal(true);
          }}
        />
      </React.Fragment>
    );
  });

  export const RightView: FunctionComponent<{
    paragraph?: string;
  }> = ({ paragraph }) => {
    const style = useStyle();
  
    return (
      <React.Fragment>
        {paragraph ? (
          <Text
            style={style.flatten([
              "body3",
              "color-text-black-low",
              "margin-right-16",
            ])}
          >
            {paragraph}
          </Text>
        ) : null}
        <AllIcon
          color={style.get("color-white").color}
        />
      </React.Fragment>
    );
  };