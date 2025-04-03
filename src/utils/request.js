import axios from "axios";

const request = axios.create({
  baseURL: "http://www.suijunqiang.top:1000/api",
});

export default request;
