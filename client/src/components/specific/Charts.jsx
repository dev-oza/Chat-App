import React from "react";
import { Doughnut, Line } from "react-chartjs-2";
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
    plugins,
} from "chart.js";
import { lightPurpleColor, orange, orangeLight, purpleColor } from "../../constants/color";
import { getLast7Days } from "../../lib/features";

ChartJS.register(
    Tooltip,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Filler,
    ArcElement,
    Legend
);

const lineChartOptions = {
    responsive: true,
    plugins:{
        legend:{
            display:false,
        },
        title:{
            display:false,
        },
    },
    scales:{
        x:{
            grid:{
                display:false,
            }
        },
        y:{
            beginAtZero: true,
            grid:{
                display:false,
            }
        }
    }
};

const LineChart = ({value=[]}) => {
    const data = {
        labels: getLast7Days(),
        datasets: [{
            data: value,
            label:"Messages",
            fill: true,
            backgroundColor: lightPurpleColor,
            borderColor: purpleColor,
        }],
    }
  return (
    <Line data={data} options={lineChartOptions} />
  );
}

const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: 100,
};

const DoughnutChart = ({value=[], labels=[]}) => {
    const data = {
        labels,
        datasets: [{
            data: value,
            label:"Total Chats Vs GroupChats",
            backgroundColor: [lightPurpleColor, orangeLight],
            hoverBackgroundColor: [purpleColor, orange],
            borderColor: [purpleColor, orange],
            offset: 30,
        }],
    }
    return (
      <Doughnut style={{zIndex:10}} data={data} options={doughnutChartOptions} />
    )
}


export {LineChart, DoughnutChart};