import React from "react";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Title from "./Title";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
});

export default function StatsCard({ title, data, formatNumber }) {
  const classes = useStyles();

  // Used to format a large number
  const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <React.Fragment>
      <Title>{title}</Title>
      <Grid container direction="column" justify="center" alignItems="center">
        {data ? (
          <Typography component="p" variant="h4">
            {formatNumber ? numberWithCommas(data) : data}
          </Typography>
        ) : (
          <Typography>No Data Available</Typography>
        )}
      </Grid>
    </React.Fragment>
  );
}
