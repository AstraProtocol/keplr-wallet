import { Interface } from "@ethersproject/abi";
import { MaxUint256 } from "@ethersproject/constants";
import {
  CurrencyAmount,
  ETHER,
  Token,
  TokenAmount,
  Trade,
} from "@solarswap/sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import erc20Abi from "../contracts/abis/erc20.json";
import { Erc20 } from "../contracts/types/Erc20";
import {
  calculateGasMargin,
  computeSlippageAdjustedAmounts,
  GAS_PRICE_GWEI,
  SwapField,
} from "../utils/for-swap";
import addresses from "../utils/for-swap/addresses";
import { getContract } from "../utils/for-swap/contract-helper";
import { CallProps, multicall } from "../utils/for-swap/multicall";
import { useSignTransaction } from "./use-sign-transaction";
import { useWeb3 } from "./use-web3";

export const useTokenAllowance = (token?: Token) => {
  const [allowance, setAllowance] = useState();
  const { chainId, accountHex } = useWeb3();
  const call: CallProps = {
    methodName: "allowance",
    target: token?.address || "",
    params: [accountHex, addresses.ROUTER[chainId]],
  };

  useEffect(() => {
    (async () => {
      const allowance = await multicall(erc20Abi, [call], chainId);
      if (allowance) {
        setAllowance(allowance[0][0]);
      }
    })();
  }, [call, chainId]);

  return useMemo(
    () => (token && allowance ? new TokenAmount(token, allowance) : undefined),
    [token, allowance]
  );
};
export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}
export function useApproveCallback(
  amountToApprove?: CurrencyAmount
): [ApprovalState, () => Promise<void>, () => Promise<void>] {
  const { chainId, etherProvider, accountHex } = useWeb3();
  const spender = addresses.ROUTER[chainId];
  const token =
    amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined;
  const currentAllowance = useTokenAllowance(token);

  const signTransaction = useSignTransaction();

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;

    if (amountToApprove.currency === ETHER) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;
    console.log("currentAllowance", currentAllowance.toFixed(4));
    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [amountToApprove, currentAllowance, spender]);

  const tokenContract = getContract(
    erc20Abi,
    token?.address ?? "",
    etherProvider
  ) as Erc20;
  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error("approve was called unnecessarily");
      return;
    }
    if (!token) {
      console.error("no token");
      return;
    }

    if (!tokenContract) {
      console.error("tokenContract is null");
      return;
    }

    if (!amountToApprove) {
      console.error("missing amount to approve");
      return;
    }

    if (!spender) {
      console.error("no spender");
      return;
    }

    let useExact = false;
    const options = {
      from: accountHex,
    };

    const estimatedGas = await tokenContract.estimateGas
      .approve(spender, MaxUint256, options)
      .catch(() => {
        // general fallback for tokens who restrict approval amounts
        useExact = true;
        return tokenContract.estimateGas.approve(
          spender,
          amountToApprove.raw.toString(),
          options
        );
      });
    const intfErc20 = new Interface(erc20Abi);
    const encodeFunctionData = intfErc20.encodeFunctionData("approve", [
      spender,
      useExact ? amountToApprove.raw.toString() : MaxUint256,
    ]);
    return signTransaction(encodeFunctionData, {
      value: 0,
      to: token?.address,
      from: accountHex,
      gasLimit: calculateGasMargin(estimatedGas),
      gasPrice: GAS_PRICE_GWEI.testnet,
    })
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("Failed to approve token", error);
      });
  }, [
    approvalState,
    token,
    tokenContract,
    amountToApprove,
    spender,
    accountHex,
    signTransaction,
  ]);

  const approveTest = useCallback(async () => {
    try {
      const estimatedGas = await tokenContract.estimateGas.approve(spender, 0, {
        from: accountHex,
      });
      const intfErc20 = new Interface(erc20Abi);
      const encodeFunctionData = intfErc20.encodeFunctionData("approve", [
        spender,
        0,
      ]);
      const a = await signTransaction(encodeFunctionData, {
        value: 0,
        to: token?.address,
        from: accountHex,
        gasLimit: calculateGasMargin(estimatedGas),
        gasPrice: GAS_PRICE_GWEI.testnet,
      });
      console.log("success", { asd: a });
    } catch (error) {
      console.error("Failed to approve", { error });
    }
  }, [accountHex, signTransaction, spender, token, tokenContract]);

  return [approvalState, approve, approveTest];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(
  trade?: Trade,
  allowedSlippage = 0
) {
  const amountToApprove = useMemo(
    () =>
      trade
        ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[
            SwapField.Input
          ]
        : undefined,
    [trade, allowedSlippage]
  );

  return useApproveCallback(amountToApprove);
}
