import LottieView from "lottie-react-native";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import { StepView, StepViewLineState, StepViewType } from "../../../components/foundation-view/step-view";
import { ErrorIcon } from "../../../components/icon/error";
import { useStore } from "../../../stores";
import { TxState, TxType } from "../../../stores/transaction";
import { useStyle } from "../../../styles";

export const TransactionStateView: FunctionComponent<{
  style?: ViewStyle
}> = observer(({
  style,
}) => {
  const { transactionStore } = useStore();
  const styleBuilder = useStyle();

  const [txState, setTxState] = useState(transactionStore.txState);
  const [amountText, setAmountText] = useState("");

  useEffect(() => {
    setTxState(transactionStore.txState);
  }, [transactionStore.txState]);

  useEffect(() => {
    setAmountText(
      transactionStore.txAmount?.toString() ?? ""
    );
  }, [transactionStore.txAmount]);

  const isFailure = txState == "failure";

  function getMainText(type: TxType, state: TxState): string {
    // send:        Đang gửi - Đã gửi thành công
    // delegate:    Đang chuyển tiền - Đầu tư thành công
    // undelegate:  Đang rút tiền - Rút tiền thành công
    // redelegate:  Đang chuyển đổi - Chuyển đổi thành công
    // withdraw:    Đang chuyển tiền lãi - Tiền lãi đã được chuyển đến bạn
    // swap:        
    const allMainText: Record<string, Record<string, string>> = {
      "send": {
        "pending": "Đang gửi",
        "success": "Đã gửi thành công",
        "failure": "Giao dịch gửi tiền thất bại",
      },
      "delegate": {
        "pending": "Đang chuyển tiền",
        "success": "Đầu tư thành công",
        "failure": "Giao dịch đầu tư thất bại",
      },
      "undelegate": {
        "pending": "Đang rút tiền",
        "success": "Rút tiền thành công",
        "failure": "Rút tiền thất bại",
      },
      "redelegate": {
        "pending": "Đang chuyển đổi",
        "success": "Chuyển đổi thành công",
        "failure": "Chuyển đổi thất bại",
      },
      "withdraw": {
        "pending": "Đang chuyển tiền lãi",
        "success": "Tiền lãi đã được chuyển đến bạn",
        "failure": "Chuyển tiền lãi thất bại",
      },
      "swap": {
        "pending": "",
        "success": "",
        "failure": "",
      },
    };

    const txTypeString = type?.toLocaleLowerCase() ?? "send";
    const txStateString = state?.toLocaleLowerCase() ?? "pending";

    return allMainText[txTypeString][txStateString];
  }

  const mainText = getMainText(transactionStore.txType, txState);

  var initialStepText = "Đã ghi nhận";
  var finalStepText = "Đang xử lý";
  var lineState: StepViewLineState = "inactive";
  var type: StepViewType = "dot";

  if (txState == "success") {
    finalStepText = "Giao dịch thành công";
    lineState = "active";
    type = "tick";
  }

  return (
    <React.Fragment>
      {isFailure
        ? (
          <View style={{ alignItems: "center", paddingHorizontal: 16, ...style }}>
            <ErrorIcon style={{ marginVertical: 24, }} />

            <Text style={styleBuilder.flatten(["text-x-large-semi-bold", "color-gray-10"])}>{mainText}</Text>
            <Text style={styleBuilder.flatten(["text-base-regular", "color-gray-30", "margin-top-8"])}>Hệ thông bị quá tải. Vui lòng thử lại</Text>
          </View>
        )
        : (
          <View style={{ alignItems: "center", ...style }}>
            <LottieView
              autoPlay
              loop={txState != "success"}
              source={
                txState != "success"
                  ? require("../../../assets/lottie/tx-sending.json")
                  : require("../../../assets/lottie/tx-loading-complete.json")
              }
              style={{
                ...txState != "success"
                  ? { width: "100%", aspectRatio: 375 / 108, }
                  : { width: 120, height: 120, },
                marginVertical: 16,
              }}
            />

            <View style={{ alignItems: "center", paddingHorizontal: 16, width: "100%" }}>
              <Text style={styleBuilder.flatten(["text-base-regular", "color-gray-30", "margin-top-8"])}>{mainText}</Text>
              <Text style={styleBuilder.flatten(["text-2x-large-medium", "color-gray-10"])}>{amountText}</Text>

              <View style={{ flexDirection: "row", alignContent: "stretch", marginTop: 26, }}>
                <StepView
                  text={initialStepText}
                  state="inactive"
                  position="start"
                  type="dot"
                  lineState={lineState}
                />
                <StepView
                  text={finalStepText}
                  state="active"
                  position="end"
                  type={type}
                  lineState={lineState}
                />
              </View>
            </View>
          </View>
        )
      }
    </React.Fragment>
  );
});