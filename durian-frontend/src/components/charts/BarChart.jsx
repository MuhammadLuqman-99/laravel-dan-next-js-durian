import { Bar } from 'react-chartjs-2';
import { commonOptions, chartColors } from './ChartConfig';
import './ChartConfig'; // Import to register components

const BarChart = ({ data, title, height = 300, horizontal = false }) => {
  const chartData = {
    labels: data.labels || [],
    datasets: data.datasets?.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.backgroundColor || (index === 0 ? chartColors.primary : chartColors.secondary),
      borderColor: dataset.borderColor || (index === 0 ? chartColors.primary : chartColors.secondary),
      borderWidth: 1,
      borderRadius: 4,
    })) || [],
  };

  const options = {
    ...commonOptions,
    indexAxis: horizontal ? 'y' : 'x',
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
