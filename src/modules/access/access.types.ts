export enum ActionEnum {
  CREATE_WORKSPACE = 'CREATE_WORKSPACE',
}

type CreateWorkspaceCtx = {
  userId: string;
};

export type PolicyContextMap = {
  [ActionEnum.CREATE_WORKSPACE]: CreateWorkspaceCtx;
};
