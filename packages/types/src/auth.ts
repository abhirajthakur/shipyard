export type SignupRequest = {
  email: string;
  password: string;
};

export type SignupResponse = {
  id: string;
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};
