const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
app.use(cors());
app.use(express.json());

const salaries = [];

fs.createReadStream('./salaries.csv')
  .pipe(csv())
  .on('data', (row) => {
    salaries.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

app.get('/api/salaries', (req, res) => {
  const summary = salaries.reduce((acc, row) => {
    const year = parseInt(row.work_year);
    const salary = parseFloat(row.salary_in_usd);
    
    if (!acc[year]) {
      acc[year] = { total_jobs: 0, total_salary: 0 };
    }
    acc[year].total_jobs += 1;
    acc[year].total_salary += salary;
    
    return acc;
  }, {});

  const result = Object.keys(summary).map(year => ({
    year: parseInt(year),
    total_jobs: summary[year].total_jobs,
    average_salary_usd: (summary[year].total_salary / summary[year].total_jobs).toFixed(2)
  }));

  res.json(result);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/api/salaries/:year', (req, res) => {
    const year = parseInt(req.params.year);
    const jobTitles = salaries
      .filter(row => parseInt(row.work_year) === year)
      .reduce((acc, row) => {
        const jobTitle = row.job_title;
        if (!acc[jobTitle]) {
          acc[jobTitle] = 0;
        }
        acc[jobTitle] += 1;
        return acc;
      }, {});
  
    const result = Object.keys(jobTitles).map(title => ({
      job_title: title,
      count: jobTitles[title]
    }));
  
    res.json(result);
  });
  