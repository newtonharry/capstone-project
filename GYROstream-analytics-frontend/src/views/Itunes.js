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
import { FaApple } from "react-icons/fa";
import "../Dashboard.css";
const _ = require("lodash");

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
  heading: {
    paddingBottom: theme.spacing(0),
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
    height: 110,
  },
  fixedHeight: {
    height: 320,
  },
  graphHeight: {
    height: 350,
  },
}));

// This component contains all of the viusualizations relevant to the itunes analytics data
export default function Itunes({ data }) {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const fixedSlimPaper = clsx(classes.paper, classes.fixedHeightSlim);
  const fixedChartPaper = clsx(classes.paper, classes.graphHeight);

  // Format the data
  let itunes_data = {
    streams: data ? data.streams : [],
    shazams: data ? data.shazams : [],
    total_streams: data
      ? _.sum(data.streams.map((day) => day.streams))
      : undefined,
    total_shazams: data
      ? _.sum(data.shazams.map((day) => day.shazams))
      : undefined,
    total_sales: data ? _.sum(data.sales.map((day) => day.units)) : undefined,
    top_country_streams: data ? data.top_country_streams : [],
    top_country_shazams: data ? data.top_country_shazams : [],
    top_country_sales: data ? data.top_country_sales : [],
  };

  return (
    <Container maxWidth="lg" className={classes.container}>
      {/** Apple Music Logo and Heading */}
      <Grid container alignItems="center" direction="row">
        <FaApple color="#D4D4D2" size={50} class="Apple-icon" />
        <Typography variant="h4" className={classes.heading}>
          Apple Music
        </Typography>
      </Grid>
      <Grid container spacing={3}>
        {/* Total Streams Chart */}
        <Grid item xs={12} md={9} lg={9}>
          <Paper className={fixedChartPaper}>
            <Chart
              title="Streams"
              axisTitle="Total"
              data={itunes_data.streams}
              dataKey="streams"
            />
          </Paper>
        </Grid>
        {/** Total Streams GRID*/}
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
                data={itunes_data.total_streams}
                formatNumber={true}
              />
            </Paper>
          </Grid>
          {/* Total Sales */}
          <Grid item>
            <Paper className={fixedSlimPaper}>
              <StatsCard
                title="Total Sales"
                data={itunes_data.total_sales}
                formatNumber={true}
              />
            </Paper>
          </Grid>
          <Grid item>
            <Paper className={fixedSlimPaper}>
              <StatsCard
                title="Total Shazams"
                data={itunes_data.total_shazams}
                formatNumber={true}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Total Shazams */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={fixedChartPaper}>
            <Chart
              title="Shazams"
              axisTitle="Total"
              data={itunes_data.shazams}
              dataKey="shazams"
            />
          </Paper>
        </Grid>

        {/* Top Country Streams */}
        <Grid item xs={12} md={4} lg={4}>
          <Paper className={fixedChartPaper}>
            <DataTable
              title="Top Country Streams"
              data={itunes_data.top_country_streams}
              metric="Streams"
              dataKey="streams"
            />
          </Paper>
        </Grid>
        {/* Top Country Shazams */}
        <Grid item xs={12} md={4} lg={4}>
          <Paper className={fixedChartPaper}>
            <DataTable
              title="Top Country Shazams"
              data={itunes_data.top_country_shazams}
              metric="Shazams"
              dataKey="shazams"
            />
          </Paper>
        </Grid>
        {/* Top Country Sales */}
        <Grid item xs={12} md={4} lg={4}>
          <Paper className={fixedChartPaper}>
            <DataTable
              title="Top Country Sales"
              data={itunes_data.top_country_sales}
              metric="Sales"
              dataKey="units"
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
