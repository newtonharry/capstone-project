import React, { useEffect } from "react";
import { useTheme } from "@material-ui/core/styles";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ResponsiveContainer } from "recharts";
import Title from "./Title";
import Typography from "@material-ui/core/Typography";

// This visualization is used to display data in a chart format
export default function Chart({ title, axisTitle, data, dataKey }) {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Title>{title}</Title>
      {Array.isArray(data) && data.length ? (
        <ResponsiveContainer>
          <LineChart
            width={730}
            height={250}
            data={data}
            margin={{
              top: 16,
              right: 16,
              bottom: 0,
              left: 24,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false}>
              <Label
                angle={270}
                position="left"
                style={{
                  textAnchor: "middle",
                  fill: theme.palette.text.primary,
                }}
              >
                {axisTitle}
              </Label>
            </YAxis>
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Typography>No Data Available</Typography>
      )}
    </React.Fragment>
  );
}
