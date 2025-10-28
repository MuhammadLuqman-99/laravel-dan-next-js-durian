import { Line } from 'react-chartjs-2';
import { commonOptions, chartColors } from './ChartConfig';
import './ChartConfig'; // Import to register components

const LineChart = ({ data, title, height = 300 }) => {
  const chartData = {
    labels: data.labels || [],
    datasets: data.datasets?.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.borderColor || (index === 0 ? chartColors.primary : chartColors.secondary),
      backgroundColor: dataset.backgroundColor || (index === 0 ? chartColors.primaryLight : chartColors.secondaryLight),
      fill: dataset.fill !== undefined ? dataset.fill : true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
    })) || [],
  };

  const options = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20,
        },
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
