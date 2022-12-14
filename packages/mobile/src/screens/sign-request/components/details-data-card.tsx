import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { ViewStyle } from "react-native";
import {
  Msg as AminoMsg,
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
} from "@cosmjs/launchpad";
import { Card, CardBody } from "../../../components/card";
import { GrantMsgObj, MsgObj } from "../models";

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
  renderBeginRedelegateMsg,
  renderDelegateMsg,
  renderGrantMsg,
  renderRawDataMessage,
  renderUnDelegateMsg,
  renderWithdrawDelegatorRewardMsg,
} from "./messages";
import { KeplrETCQueries } from "@keplr-wallet/stores-etc";
import { useStyle } from "../../../styles";

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
      return msgs.map((msg, i) => {
        const chainId = chainStore.current.chainId;
        const account = accountStore.getAccount(chainId);
        const chainInfo = chainStore.getChain(chainId);
        const { content } = renderMessage(
          account,
          msg,
          chainInfo.currencies,
          queriesStore,
          chainId,
          account.bech32Address,
          i
        );

        return (
          <CardBody style={style.flatten(["padding-y-8"])} key={i.toString()}>
            {content}
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
  unknownMsg: any,
  currencies: AppCurrency[],
  queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, SecretQueries, KeplrETCQueries]
  >,
  chainId: string,
  bech32Address: string,
  index: number
): {
  title: string;
  content: React.ReactElement;
  scrollViewHorizontal?: boolean;
} {
  if ("type" in unknownMsg) {
    const msg = unknownMsg as MsgObj;
    if (msg.type === msgOpts.cosmos.msgOpts.redelegate.type) {
      const value = msg.value as MsgBeginRedelegate["value"];
      const queries = queriesStore.get(chainId);
      const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
        Staking.BondStatus.Unspecified
      );
      const srcValidator = queryValidators.getValidator(
        value.validator_src_address
      );
      const dstValidator = queryValidators.getValidator(
        value.validator_dst_address
      );
      return renderBeginRedelegateMsg(
        currencies,
        value.amount,
        srcValidator?.description.moniker ?? value.validator_src_address,
        dstValidator?.description.moniker ?? value.validator_dst_address
      );
    }

    if (msg.type === msgOpts.cosmos.msgOpts.undelegate.type) {
      const value = msg.value as MsgUndelegate["value"];
      const queries = queriesStore.get(chainId);
      const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
        Staking.BondStatus.Unspecified
      );
      const validator = queryValidators.getValidator(value.validator_address);
      return renderUnDelegateMsg(
        currencies,
        value.amount,
        validator?.description.moniker ?? value.validator_address
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
      const queries = queriesStore.get(chainId);
      const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
        Staking.BondStatus.Unspecified
      );
      const queryReward = queries.cosmos.queryRewards.getQueryBech32Address(
        bech32Address
      );
      const rewards = queryReward.getStakableRewardOf(value.validator_address);
      const validator = queryValidators.getValidator(value.validator_address);

      return renderWithdrawDelegatorRewardMsg(
        rewards,
        validator?.description.moniker ?? value.validator_address
      );
    }
  } else if ("grantee" in unknownMsg) {
    const grantMsg = unknownMsg as GrantMsgObj;
    if (grantMsg.grantee) {
      console.log("__DEBUG__", grantMsg.grantee, grantMsg.msgs);
      return renderGrantMsg(grantMsg.msgs);
    }
  }

  return renderRawDataMessage(unknownMsg, false, index);
}
