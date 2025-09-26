export interface TwitterUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
  };
}

export interface TwitterTokenResponse {
  token_type: string;
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}
