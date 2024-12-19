const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database connection configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Raghavee@11',
});

// Connect to MySQL and set up database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL server:', err);
    return;
  }
  console.log('Connected to MySQL server');

  // Create Database if it doesn't exist
  db.query('CREATE DATABASE IF NOT EXISTS employee_management', (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    console.log('Database "employee_management" is ready');

    // Connect to the database
    const dbWithDatabase = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Raghavee@11',
      database: 'employee_management',
    });

    // Create table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        employeeId VARCHAR(10) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        department VARCHAR(50) NOT NULL,
        dateOfJoining DATE NOT NULL,
        role VARCHAR(100) NOT NULL
      );
    `;

    dbWithDatabase.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        return;
      }
      console.log('Employees table is ready');
    });
    // API route to handle employee form submission
    app.post('/api/employees', (req, res) => {
      const { name, employeeId, email, phone, department, dateOfJoining, role } = req.body;

      const insertQuery = `
        INSERT INTO employees (name, employeeId, email, phone, department, dateOfJoining, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `;

      dbWithDatabase.query(
        insertQuery,
        [name, employeeId, email, phone, department, dateOfJoining, role],
        (err, result) => {
          if (err) {
            console.error('Error inserting data:', err);
            res.status(500).json({ message: 'Error saving employee data' });
            return;
          }
          res.status(200).json({ message: 'Employee successfully added!', id: result.insertId });
        }
      );
    });

    // API route to get all employees
    app.get('/api/employees', (req, res) => {
      const selectQuery = 'SELECT * FROM employees';
      console.log(selectQuery);
      dbWithDatabase.query(selectQuery, (err, results) => {
        if (err) {
          console.error('Error fetching employees:', err);
          res.status(500).json({ message: 'Error retrieving employee data' });
          return;
        }
        res.status(200).json(results);
      });
    });

    // Start the Express server
    app.listen(3000, () => {
      console.log('Server running on http://localhost:3000');
    });
  });
});
