import axiosWithInterceptorInstance from "./AxiosConfig";

const setGlobalHeader = () =>{
    if (localStorage.getItem("token")) {
        axiosWithInterceptorInstance.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
      }
}

export default setGlobalHeader