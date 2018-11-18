import CONFIG from '../config/config';
import axios from 'axios';

/* axios.interceptors.request.use(function (config) {
    return config;
}, function (error) {    
    return Promise.reject(error);
}); */

function processUrl(options){
    let returnOptions = {headers: {} , endpoint: options.elastic ? CONFIG.ELASTIC_URL : CONFIG.API_URL};
    if(options.elastic) {
        returnOptions['auth'] = {username : CONFIG.ELASTIC_USERNAME, password: CONFIG.ELASTIC_PASSWORD};
    }
    else if(localStorage.getItem(CONFIG.LOCALSTORAGE_LOGGEDIN_USER_KEY)){
        try {
            let localData = JSON.parse(localStorage.getItem(CONFIG.LOCALSTORAGE_LOGGEDIN_USER_KEY));
            if(localData && localData.token){
                returnOptions.headers['Authorization'] = 'Bearer '+localData.token;
            }
        } catch (error) {
            console.error("Auth token is not present in localhost");
        }
    }
    return returnOptions;
}
export default {

  get: (url, options = {})=>{
    var processedConfig = processUrl(options);
    return axios.get(processedConfig.endpoint + url,  processedConfig);
  },
  post : function(url, payload, options= {}){   
    var processedConfig = processUrl(options);    
    return axios.post(processedConfig.endpoint + url, payload, processedConfig);
  },
  put : function(url, payload, options= {}){
    var processedConfig = processUrl(options);    
    return axios.put(processedConfig.endpoint + url, payload, processedConfig);
  },
  delete : function(url, payload, options= {}){
    var processedConfig = processUrl(options);    
    return axios.delete(processedConfig.endpoint + url, payload, processedConfig);
  }
}