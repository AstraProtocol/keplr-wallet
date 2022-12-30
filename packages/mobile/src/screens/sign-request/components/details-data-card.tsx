import React, { FunctionComponent } from "react";
import {
  Msg as AminoMsg,
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
} from "@cosmjs/launchpad";
import { GrantMsgObj, MsgObj } from "../models";

import {
  CosmosMsgOpts,
  CosmosQueries,
  CosmwasmMsgOpts,
  CosmwasmQueries,
  QueriesStore,
  SecretMsgOpts,
  SecretQueries,
  Staking,
} from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";

import {
  renderBeginRedelegateMsg,
  renderDelegateMsg,
  renderGrantMsg,
  renderRawDataMessage,
  renderUnDelegateMsg,
  renderWithdrawDelegatorRewardMsg,
} from "./messages";
import { KeplrETCQueries } from "@keplr-wallet/stores-etc";
import { IntlShape } from "react-intl";

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
  index: number,
  intl: IntlShape
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
        dstValidator?.description.moniker ?? value.validator_dst_address,
        intl
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
        validator?.description.moniker ?? value.validator_address,
        intl
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
        validator?.description.moniker ?? value.validator_address,
        intl
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
        validator?.description.moniker ?? value.validator_address,
        intl
      );
    }
  } else if ("grantee" in unknownMsg) {
    const grantMsg = unknownMsg as GrantMsgObj;
    if (grantMsg.grantee) {
      console.log("__DEBUG__", grantMsg.grantee, grantMsg.msgs);
      return renderGrantMsg(grantMsg.msgs, intl);
    }
  }

  return renderRawDataMessage(unknownMsg, false, index);
}
