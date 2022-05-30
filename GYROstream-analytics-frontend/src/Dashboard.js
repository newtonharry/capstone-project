import React, { useState, useEffect } from "react";
import Box from "@material-ui/core/Box";
import Spotify from "./views/Spotify";
import Itunes from "./views/Itunes";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { Grid } from "@material-ui/core";
import { palette } from "@material-ui/system";
import "./Dashboard.css";
import { getArtistCatalogue, getArtistAnalyticsData } from "./API";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";

import Typography from "@material-ui/core/Typography";
import { FaSpotify } from "react-icons/fa";

const _ = require("lodash");

// Material-UI's styling solution to declaring classnames
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  box: {
    paddingTop: theme.spacing(9),
  },
  content: {
    flexGrow: 1,
    overflow: "visible",
  },
  heading: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(50),
    color: "#D4D4D2",
  },
  icon: {
    paddingBottom: theme.spacing(0),
  },
}));

const mergeOptions = (releases) => {
  let options = [];
  releases.forEach((release) => {
    var existing = options.filter(function (option) {
      return option.label === release.label;
    });
    if (existing.length) {
      var existingIndex = options.indexOf(existing[0]);
      options[existingIndex].value = options[existingIndex].value.concat(
        release.value
      );
    } else {
      options.push(release);
    }
  });
  return options;
};

export default function Dashboard() {
  // This const allows the components to call the useStyles function
  //  for their relevant styling options
  const classes = useStyles();

  // Hook to alter the loading state of the dashboard
  const [loading, setLoading] = useState(false);

  // Data to hold the analytics data which is retrieved
  const [analyticsData, setAnalyticsData] = useState({});
  const [isrcs, setIsrcs] = useState([]);

  // Hooks to manage the select values
  const [range, setRange] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [track, setTrack] = useState("");

  // Hooks to update the option values
  const [artistOptions, setArtistOptions] = useState([]);
  const [albumOptions, setAlbumOptions] = useState([]);
  const [trackOptions, setTrackOptions] = useState([]);

  // Values are one extra because of SQL not calulcating the date range properly
  const rangeOptions = [
    { value: "7", label: "7 Days" },
    { value: "14", label: "2 Weeks" },
    { value: "31", label: "1 Month" },
    { value: "186", label: "6 Months" },
    { value: "365", label: "1 Year" },
    { value: "365", label: "All Time" }, // TODO: This value needs to be different, not sure what the earliest value could/should be
  ];

  // Handles when the range select is changed
  const handleRangeChange = (selectedOption) => {
    setRange(selectedOption);
  };

  // Handles when the artist select is changed
  const handleArtistChange = (selectedOption) => {
    setArtist(selectedOption);
    setAlbum("");
    setTrack("");
    setIsrcs(
      _.flatten(
        selectedOption.value.map((album) =>
          album.value.map((track) => track.value)
        )
      )
    );
  };

  // Handles when the album select is changed
  const handleAlbumChange = (selectedOption) => {
    setAlbum(selectedOption);
    setTrack("");
    setIsrcs(selectedOption.value.map((track) => track.value));
  };

  // Handles when the track select is changed
  const handleTrackChange = (selectedOption) => {
    setTrack(selectedOption);
    setIsrcs([selectedOption.value]);
  };

  // Update album options if the artist is updated
  useEffect(() => {
    setAlbumOptions(artist.value);
  }, [artist]);

  // Update the track options if the album is updated
  useEffect(() => {
    setTrackOptions(album.value);
  }, [album]);

  // Update the release select component on mount
  useEffect(() => {
    getArtistCatalogue()
      .then((res) => {
        let releases = res.data;
        releases = releases.map((release) => {
          let { artist, album, track, isrc } = release;
          return {
            label: artist,
            value: [
              {
                label: album,
                value: [
                  {
                    label: track,
                    value: isrc,
                  },
                ],
              },
            ],
          };
        });

        // Merge the artist's
        let options = mergeOptions(releases);

        // Merge the albums for each artist
        options.forEach(
          (artist) => (artist.value = mergeOptions(artist.value))
        );

        // Set the artist options for the artist select
        setArtistOptions(options);

        // Set the isrcs to all of the artists isrcs in order to initally get all of the artist data
        setIsrcs(
          options.map((artist) =>
            artist.value.map((album) => album.value.map((track) => track.value))
          )
        );

        // Set range value to 7 as default value is 7 days
        setRange("7");

        // Set the loading to true as all of the artist data is being retrieved
        setLoading(true);
      })
      .catch((err) => console.log(err));
  }, []);

  // Get the analytics data if the release value is updated
  useEffect(() => {
    getArtistAnalyticsData(isrcs, range.value)
      .then((res) => {
        console.log(res.data);
        setAnalyticsData(res.data);
      })
      .catch((err) => console.log(err));
    setLoading(false);
  }, [isrcs, range]);

  return (
    <Box bgcolor="text.disabled" className={classes.box}>
      <div className={classes.root}>
        <CssBaseline />
        <main className={classes.content}>
          {/** Spotify Logo & Select Drop down grid */}
          <Grid container direction="column">
            <Grid
              container
              item
              direction="row"
              alignItems="flex-end"
              justify="center"
              xs={12}
            >
              <FaSpotify
                style={{ color: "#1DB954" }}
                size={50}
                className={classes.icon}
              />
              <Typography variant="h4" className={classes.heading}>
                Spotify
              </Typography>

              <Grid item xs={3} md={2} lg={1}>
                {/**theme here specifically targets and overrides the colour and BG of the dropdown*/}
                <Select
                  placeholder="Select Date Range"
                  defaultValue={rangeOptions[0]} // Default value is 7 days
                  options={rangeOptions}
                  onChange={handleRangeChange}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 0,
                    colors: {
                      ...theme.colors,
                      text: "black",
                      primary25: "#00B388",
                      primary: "#0085CA",
                    },
                  })}
                />
              </Grid>
              <Grid item xs={3} md={2} lg={1}>
                <Select
                  value={artist}
                  placeholder="Select Artist"
                  defaultValue={{ label: "All Artists", value: artistOptions }} // Default value is all artists
                  options={artistOptions}
                  onChange={handleArtistChange}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 0,
                    colors: {
                      ...theme.colors,
                      text: "black",
                      primary25: "#00B388",
                      primary: "#0085CA",
                    },
                  })}
                />
              </Grid>
              <Grid item xs={3} md={2} lg={1}>
                <Select
                  value={album}
                  placeholder="Select Album"
                  options={albumOptions}
                  onChange={handleAlbumChange}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 0,
                    colors: {
                      ...theme.colors,
                      text: "black",
                      primary25: "#00B388",
                      primary: "#0085CA",
                    },
                  })}
                />
              </Grid>
              <Grid item xs={3} md={2} lg={1}>
                <Select
                  value={track}
                  placeholder="Select Track"
                  options={trackOptions}
                  onChange={handleTrackChange}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 0,
                    colors: {
                      ...theme.colors,
                      text: "black",
                      primary25: "#00B388",
                      primary: "#0085CA",
                    },
                  })}
                />
              </Grid>
            </Grid>
            {/* If waiting for the request response (query taking a long time), display a loading spinner icon, else show the spotify and itunes dashboard components*/}
            {!loading ? (
              /** Visualisations components of both Spotify and Itunes (Apple Music) */
              <div>
                <Spotify data={analyticsData.spotify} />
                <Grid item>
                  <Itunes data={analyticsData.itunes} />
                </Grid>
              </div>
            ) : (
              <Loader
                type="Puff"
                color="#00BFFF"
                height={100}
                width={100}
                timeout={3000} //3 secs
              />
            )}
            {/* <Spotify data={analyticsData.spotify} />

            <Grid item>
              <Itunes data={analyticsData.itunes} />
            </Grid> */}
          </Grid>
        </main>
      </div>
    </Box>
  );
}
