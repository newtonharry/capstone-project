import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Chart from "../components/Chart";
import StatsCard from "../components/StatsCard";
import DataTable from "../components/DataTable";
import Demographics from "../components/Demographics";
import { FaSpotify } from "react-icons/fa";
const _ = require("lodash");

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
  heading: {
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    color: "#D4D4D2",
  },
  icon: {
    paddingBottom: theme.spacing(1),
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "hidden",
    flexDirection: "column",
  },

  fixedHeightSlim: {
    height: 160,
  },
  fixedHeight: {
    height: 320,
  },
  graphHeight: {
    height: 350,
  },
}));

// This component contains all of the viusualizations relevant to the spotify analytics data
export default function Spotify({ data }) {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const fixedSlimPaper = clsx(classes.paper, classes.fixedHeightSlim);
  const fixedChartPaper = clsx(classes.paper, classes.graphHeight);

  // Format the data
  let spotify_data = {
    streams: data ? data.streams : [],
    total_streams: data
      ? _.sum(data.streams.map((day) => day.streams))
      : undefined,
    total_skips: data ? _.sum(data.skips.map((day) => day.skips)) : undefined,
    top_streaming_countries: data ? data.top_countries : [],
  };

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={3}>
        {/* Total Streams Chart */}
        <Grid item xs={12} md={9} lg={9}>
          <Paper className={fixedChartPaper}>
            <Chart
              title="Streams"
              axisTitle="Total"
              data={spotify_data.streams}
              dataKey="streams"
            />
          </Paper>
        </Grid>
        {/* Streams and Skip % Grid container */}
        <Grid
          item
          container
          xs={12}
          md={3}
          lg={3}
          direction="column"
          justify="space-between"
        >
          {/* Total Streams */}
          <Grid item>
            <Paper className={fixedSlimPaper}>
              <StatsCard
                title="Total Streams"
                data={spotify_data.total_streams}
                formatNumber={true}
              />
            </Paper>
          </Grid>
          {/* Skip percentage */}
          <Grid item>
            <Paper className={fixedSlimPaper}>
              <StatsCard
                title="Skip Rate %"
                data={Math.round(
                  (spotify_data.total_skips /
                    (spotify_data.total_skips + spotify_data.total_streams)) *
                    100
                )}
                formatNumber={false}
              />
            </Paper>
          </Grid>
        </Grid>
        {/* Top Countries By Streams */}
        <Grid item xs={12} md={4} lg={4}>
          <Paper className={fixedHeightPaper}>
            <DataTable
              title="Top Country Streams"
              data={spotify_data.top_streaming_countries}
              metric="Streams"
              dataKey="streams"
            />
          </Paper>
        </Grid>
        {/* Gender */}
        <Grid item xs={12} md={4} lg={4}>
          <Paper className={fixedHeightPaper}>
            <Demographics title="Gender Demographics" data={[]} />
          </Paper>
        </Grid>
        {/* Age Demographics */}
        <Grid item xs={12} md={4} lg={4}>
          <Paper className={fixedHeightPaper}>
            <Demographics title="Age Demographics" data={[]} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
