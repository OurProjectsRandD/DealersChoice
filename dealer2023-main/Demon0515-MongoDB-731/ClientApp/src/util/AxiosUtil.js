import axios from "axios";

export const GetFullURL = (url) => {
    let baseURL = process.env.REACT_APP_API_HOST || '';

    // If the base URL doesn't end with a slash, add one
    if (baseURL && !baseURL.endsWith('/')) {
        baseURL += '/';
    }

    // If the url is undefined or null, replace with an empty string
    if (!url) {
        url = '';
    }

    // Concatenate the base URL with the url, removing any 'undefined' part
    return (baseURL + url).replace('undefined', '');
};

export const SendRequest = (config) => {
    const token = localStorage.getItem("jwt_token");

    if (token !== null) {
        if (config.headers === undefined) config.headers = {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return axios({
        method: "post",
        data: {},
        ...config,
        url: GetFullURL(config.url),
    });
};
