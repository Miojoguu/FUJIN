import apiLogin from "./apiLogin";

interface LoginResponse {
  token: string;
}

export const loginRequest = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await apiLogin.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  console.log(response.data);
  return response.data;
};

export const registerRequest = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await apiLogin.post("/users", { name, email, password });
  return response.data;
};

