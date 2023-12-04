import axios from "axios";

//const baseURL = "http://localhost:3001/api"
//const baseURL = "/api"

const baseURL = process.env.NODE_ENV === 'production' ? "/api" : "http://localhost:3001";
export default axios.create({
    baseURL,
})