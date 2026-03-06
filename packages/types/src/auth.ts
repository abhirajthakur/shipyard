export type SignupRequest = {
  email: string;
  password: string;
};

export type SigninRequest = {
  email: string;
  password: string;
};

export type SigninResponse = {
  token: string;
};
