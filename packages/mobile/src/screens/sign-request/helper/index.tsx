import { GrantMsgObj, MsgObj } from "../models";

export enum SignMsgType {
  Delegate = "SignMsgType.Delegate",
  Redelegate = "SignMsgType.Redelegate",
  Undelegate = "SignMsgType.Undelegate",
  WithdrawReward = "SignMsgType.WithdrawReward",
  Grant = "SignMsgType.Grant",
  Revoke = "SignMsgType.Revoke",
  Unknown = "SignMsgType.Unknown",
}

export function typeOf(msg: any): SignMsgType {
  if ("type" in msg) {
    const msgObj = msg as MsgObj;
    switch (msgObj.type) {
      case "cosmos-sdk/MsgDelegate":
        return SignMsgType.Delegate;
      case "cosmos-sdk/MsgBeginRedelegate":
        return SignMsgType.Redelegate;
      case "cosmos-sdk/MsgUndelegate":
        return SignMsgType.Undelegate;
      case "cosmos-sdk/MsgWithdrawDelegationReward":
        return SignMsgType.WithdrawReward;
    }
  } else if ("grantee" in msg) {
    const grantMsgObj = msg as GrantMsgObj;
    if (grantMsgObj.grantee) {
      const msgs = grantMsgObj.msgs;
      for (const grantMsg of msgs) {
        console.log(typeof grantMsg);
        if (typeof grantMsg == "object" && "grant" in grantMsg) {
          return SignMsgType.Grant;
        } else if (typeof grantMsg == "object" && "msg_type_url" in grantMsg) {
          return SignMsgType.Revoke;
        }
      }
    }
  }
  return SignMsgType.Unknown;
}

export function getType(msgs: any[]): SignMsgType {
  for (const msg of msgs) {
    console.log(typeof msg);
    if (typeof msg === "object" && typeOf(msg) !== SignMsgType.Unknown) {
      return typeOf(msg);
    }
  }
  return SignMsgType.Unknown;
}

export function getTitle(type: SignMsgType): string {
  switch (type) {
    case SignMsgType.Unknown:
      return "";
  }
  return type;
}

export function getHeaderTitle(type: SignMsgType): string {
  switch (type) {
    case SignMsgType.Unknown:
      return "Chi tiết";
  }
  return type;
}
