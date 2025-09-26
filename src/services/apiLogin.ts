import axios from "axios";
import { IP_BACKEND } from "../env";

const apiLogin = axios.create({
  baseURL: `${IP_BACKEND }`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiLogin;
