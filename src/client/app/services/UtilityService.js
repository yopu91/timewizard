

const chartColors = [
  { // Green
    backgroundColor: "rgba(70,134,75,0.2)",
    borderColor: "rgba(70,134,75,1)",
    pointBackgroundColor: "rgba(70,134,75,1)"
  },
  { // Blue
      backgroundColor: "rgba(0,78,140,0.2)",
      borderColor: "rgba(0,78,140,1)",
      pointBackgroundColor: "rgba(0,78,140,1)"
  },
  { // Purple
    backgroundColor: "rgba(73,29,118,0.2)",
    borderColor: "rgba(73,29,118,1)",
    pointBackgroundColor: "rgba(73,29,118,1)"
  },
  { // Red
      backgroundColor: "rgba(184,17,24,0.2)",
      borderColor: "rgba(184,17,24,1)",
      pointBackgroundColor: "rgba(184,17,24,1)"
  },
  { // Orange
    backgroundColor: "rgba(194,105,25,0.2)",
    borderColor: "rgba(194,105,25,1)",
    pointBackgroundColor: "rgba(194,105,25,1)"
  },
  { // Yellow
    backgroundColor: "rgba(203,190,0,0.2)",
    borderColor: "rgba(203,190,0,1)",
    pointBackgroundColor: "rgba(203,190,0 ,1)"
  },
  { // Yellow-Green
    backgroundColor: "rgba(1,137,137,0.2)",
    borderColor: "rgba(1,137,137,1)",
    pointBackgroundColor: "rgba(1,137,137 ,1)"
  },
  { // Blue-Green
    backgroundColor: "rgba(70,134,75,0.2)",
    borderColor: "rgba(70,134,75,1)",
    pointBackgroundColor: "rgba(70,134,75,1)"
  },
  { // Blue-Purple
      backgroundColor: "rgba(23,46,124,0.2)",
      borderColor: "rgba(23,46,1240,1)",
      pointBackgroundColor: "rgba(23,46,124,1)"
  },
  { // Red-Purple
    backgroundColor: "rgba(129,13,112,0.2)",
    borderColor: "rgba(129,13,112,1)",
    pointBackgroundColor: "rgba(129,13,112,1)"
  },
  { // Red-Orange
      backgroundColor: "rgba(187,48,45,0.2)",
      borderColor: "rgba(187,48,45,1)",
      pointBackgroundColor: "rgba(187,48,45,1)"
  },
  { // Yellow-Orange
    backgroundColor: "rgba(193,130,16,0.2)",
    borderColor: "rgba(193,130,16,1)",
    pointBackgroundColor: "rgba(193,130,16,1)"
  }
];

export function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getChartColor(index) {
  return chartColors[index % 7];
}