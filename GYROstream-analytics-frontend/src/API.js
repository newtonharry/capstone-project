import axios from "axios";

const WEBSITE = "https://www.beta2.gyrostream.com";
const CATALOGUE = `${WEBSITE}/get_artist_catalogue.php`;
const ANALYTICS = `${WEBSITE}/artist_analytics.php`;

// axios.defaults.proxy.host = WEBSITE;

// function to provide reusable code for get requests
const getData = (endpoint, data) => {
  return axios.get(`${endpoint}`, { ...data, crossdomain: true }).then(
    (res) => res,
    (error) => error.response
  );
};

// function to provide reusable code for post requests
const postData = (endpoint, params) => {
  return axios.post(`${endpoint}`, { ...params, crossdomain: true }).then(
    (res) => res,
    (error) => error.response
  );
};

// Get all of the stock symbols in a basic format
export const getArtistCatalogue = (industry) => {
  return getData(`${CATALOGUE}`, {});
};

export const getArtistAnalyticsData = (isrc, range) => {
  return postData(
    `${ANALYTICS}`,
    { isrc: isrc, range: range },
    {
      headers: { "content-type": "application/json" },
    }
  );
};
