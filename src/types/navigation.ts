export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  CreateGroup: undefined;
  AddExpense: { groupId?: string } | undefined;
  GroupDetails: { groupId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  VerifyOtp: { email: string };
  ForgotPassword: undefined;
  CheckEmail: { email: string };
  ResetPassword: { token: string };
};
