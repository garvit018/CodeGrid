import axios from "axios";
import { API_URL } from "../constants.jsx";

export default axios.create({
  baseURL: API_URL,
});
