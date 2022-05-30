import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "./Title";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

// This visualization is used to display data in a table like format
export default function DataTable({ title, data, metric, dataKey }) {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Title>{title}</Title>
      {Array.isArray(data) && data.length ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Position</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>{metric}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              ? data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{`${index + 1}`}</TableCell>
                    <TableCell>{row.country}</TableCell>
                    <TableCell>{row[dataKey]}</TableCell>
                  </TableRow>
                ))
              : ""}
          </TableBody>
        </Table>
      ) : (
        <Typography>No Data Available</Typography>
      )}
    </React.Fragment>
  );
}
