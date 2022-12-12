export interface MsgObj {
  readonly type: string;
  readonly value: unknown;
}
export interface GrantMsgObj {
  readonly grantee: string;
  readonly msgs: any[];
}
export interface MsgGrant {
  granter: string;
  grantee: string;
  grant: Grant | undefined;
}

export interface Grant {
  authorization: Authorization | undefined;
  expiration: Date | undefined;
}

export interface Authorization {
  msg: string;
}

export interface MsgRevoke {
  granter: string;
  grantee: string;
  msg_type_url: string;
}
