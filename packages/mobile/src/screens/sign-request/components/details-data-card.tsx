import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { ScrollView, View, ViewStyle } from "react-native";
import {
  Msg as AminoMsg,
  MsgBeginRedelegate,
  MsgDelegate,
  MsgSend,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
} from "@cosmjs/launchpad";
import { Card, CardBody } from "../../../components/card";
import { MsgObj } from "../models";
import { useStyle } from "../../../styles";

import {
  AccountSetBaseSuper,
  AccountStore,
  CosmosAccount,
  CosmosMsgOpts,
  CosmosQueries,
  CosmwasmAccount,
  CosmwasmMsgOpts,
  CosmwasmQueries,
  QueriesStore,
  SecretAccount,
  SecretMsgOpts,
  SecretQueries,
  Staking,
} from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";

import { ChainStore } from "../../../stores/chain";
import {
  MsgTransfer,
  renderMsgBeginRedelegate,
  renderMsgDelegate,
  renderMsgExecuteContract,
  renderMsgSend,
  renderMsgTransfer,
  renderMsgUndelegate,
  renderMsgVote,
  renderMsgWithdrawDelegatorReward,
} from "../../../modals/sign/messages";
import { renderDelegateMsg, renderRawDataMessage } from "./messages";
import { KeplrETCQueries } from "@keplr-wallet/stores-etc";

export const DetailsDataCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  msgs: AminoMsg[];
  accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount],
    AccountSetBaseSuper & CosmosAccount & CosmwasmAccount & SecretAccount
  >;
  chainStore: ChainStore;
  queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, SecretQueries, KeplrETCQueries]
  >;
}> = observer(
  ({ containerStyle, msgs, accountStore, chainStore, queriesStore }) => {
    const style = useStyle();
    const renderedMsgs = (() => {
      return (msgs as readonly AminoMsg[]).map((msg, i) => {
        const chainId = chainStore.current.chainId;
        const account = accountStore.getAccount(chainId);
        const chainInfo = chainStore.getChain(chainId);
        
        const { content } = renderMessage(
          account,
          msg,
          chainInfo.currencies,
          queriesStore,
          chainId
        );

        return (
          <CardBody key={i.toString()}>
            {content}
            {msgs.length - 1 !== i ? (
              <View
                style={style.flatten([
                  "height-1",
                  "background-color-border-white",
                  "margin-x-16",
                ])}
              />
            ) : null}
          </CardBody>
        );
      });
    })();

    return <Card style={containerStyle}>{renderedMsgs}</Card>;
  }
);

export function renderMessage(
  msgOpts: {
    readonly cosmos: {
      readonly msgOpts: CosmosMsgOpts;
    };
    readonly cosmwasm: {
      readonly msgOpts: CosmwasmMsgOpts;
    };
    readonly secret: {
      readonly msgOpts: SecretMsgOpts;
    };
  },
  msg: MsgObj,
  currencies: AppCurrency[],
  queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, SecretQueries, KeplrETCQueries]
  >,
  chainId: string
): {
  title: string;
  content: React.ReactElement;
  scrollViewHorizontal?: boolean;
} {
  if (msg.type === msgOpts.cosmos.msgOpts.ibcTransfer.type) {
    const value = msg.value as MsgTransfer["value"];
    return renderMsgTransfer(
      currencies,
      value.token,
      value.receiver,
      value.source_channel
    );
  }

  if (msg.type === msgOpts.cosmos.msgOpts.redelegate.type) {
    const value = msg.value as MsgBeginRedelegate["value"];
    return renderMsgBeginRedelegate(
      currencies,
      value.amount,
      value.validator_src_address,
      value.validator_dst_address
    );
  }

  if (msg.type === msgOpts.cosmos.msgOpts.undelegate.type) {
    const value = msg.value as MsgUndelegate["value"];
    return renderMsgUndelegate(
      currencies,
      value.amount,
      value.validator_address
    );
  }

  if (msg.type === msgOpts.cosmos.msgOpts.delegate.type) {
    const value = msg.value as MsgDelegate["value"];
    const queries = queriesStore.get(chainId);
    const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
      Staking.BondStatus.Unspecified
    );
    const validator = queryValidators.getValidator(value.validator_address);

    return renderDelegateMsg(
      currencies,
      value.amount,
      validator?.description.moniker ?? value.validator_address
    );
  }

  if (msg.type === msgOpts.cosmos.msgOpts.withdrawRewards.type) {
    const value = msg.value as MsgWithdrawDelegatorReward["value"];
    return renderMsgWithdrawDelegatorReward(value.validator_address);
  }

  return renderRawDataMessage(msg);
}
