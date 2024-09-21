import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'antd/dist/reset.css';

interface SalaryData {
  year: number;
  total_jobs: number;
  average_salary_usd: string;
}

interface JobTitleData {
  job_title: string;
  count: number;
}

const App: React.FC = () => {
  const [data, setData] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobTitles, setJobTitles] = useState<JobTitleData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/salaries')
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const handleRowClick = (record: SalaryData) => {
    setSelectedYear(record.year);
    axios.get(`http://localhost:5000/api/salaries/${record.year}`)
      .then((response) => {
        setJobTitles(response.data);
      })
      .catch((error) => {
        console.error('Error fetching job titles:', error);
      });
  };

  const columns = [
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      sorter: (a: SalaryData, b: SalaryData) => a.year - b.year,
    },
    {
      title: 'Total Jobs',
      dataIndex: 'total_jobs',
      key: 'total_jobs',
      sorter: (a: SalaryData, b: SalaryData) => a.total_jobs - b.total_jobs,
    },
    {
      title: 'Average Salary (USD)',
      dataIndex: 'average_salary_usd',
      key: 'average_salary_usd',
      sorter: (a: SalaryData, b: SalaryData) => parseFloat(a.average_salary_usd) - parseFloat(b.average_salary_usd),
    },
  ];

  const jobTitleColumns = [
    {
      title: 'Job Title',
      dataIndex: 'job_title',
      key: 'job_title',
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  return (
    <div style={{ padding: 20 }}>
     <center> <h1>ML Engineer Salaries (2020 - 2024)</h1></center>

      
      <h2>Job Trends (2020 - 2024)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total_jobs" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>

      
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="year"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
      />

     
      {selectedYear && (
        <div>
          <h2>Job Titles for {selectedYear}</h2>
          <Table
            columns={jobTitleColumns}
            dataSource={jobTitles}
            rowKey="job_title"
          />
        </div>
      )}
    </div>
  );
};

export default App;