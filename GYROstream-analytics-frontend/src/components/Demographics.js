import React from "react";
import { useTheme } from "@material-ui/core/styles";
import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Title from "./Title";
import Typography from "@material-ui/core/Typography";

// This visualization is a pie chart for containing demographics related data such as gender and age
export default function Demographics({ title, data }) {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Title>{title}</Title>
      {Array.isArray(data) && data.length ? (
        <PieChart>
          <Legend verticalAlign="top" height={36} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={50}
            fill="#8884d8"
          />
          <Tooltip />
        </PieChart>
      ) : (
        <Typography>No Data Available</Typography>
      )}
    </React.Fragment>
  );
}
