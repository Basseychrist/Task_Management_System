# Task Management System

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)

## About the Project

Task Management System is a web application designed to help users organize, track, and manage their daily tasks efficiently.  
Built with **Node.js** and **Express.js** for the backend, and **EJS** for templating, it provides a robust and scalable solution for individuals and teams.

- **Problem Solved:** Streamlines task organization and progress tracking.
- **Primary Purpose:** Simplifies task management and improves productivity.
- **Target Users:** Individuals, students, and teams needing a centralized task management platform.

## Features

- Create, update, and delete tasks
- User authentication and session management
- Dynamic content rendering using EJS templates
- Data validation and error handling
- RESTful API endpoints
- Integration with MongoDB for persistent storage
- Logging and request monitoring with Morgan
- (Add more features as your app evolves)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm (comes bundled with Node.js)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Basseychrist/Task_Management_System.git
   cd Task_Management_System
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

## Usage

1. Start the server:
   ```sh
   npm start
   ```
   or
   ```sh
   node app.js
   ```
2. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Basic Interaction

- Visit `/about` to learn more about the app.
- The homepage displays your current tasks and options to add or manage them.

## Project Structure

task-management-system/
├── config/
│   ├── database.js
│   └── passport.js
├── controllers/
│   ├── authController.js
│   ├── taskController.js
│   └── userController.js
├── doc/              <-- NEW FOLDER
│   └── swaggerDef.json <-- NEW FILE (Swagger definition moved here)
├── middleware/
│   └── auth.js
├── models/
│   ├── task.js
│   └── user.js
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── routes/
│   ├── auth.js
│   ├── index.js
│   ├── tasks.js
│   └── users.js
├── views/
│   ├── layouts/
│   │   ├── main.ejs
│   │   └── login.ejs
│   ├── partials/
│   │   ├── _head.ejs
│   │   ├── _header.ejs
│   │   ├── _navigation.ejs
│   │   └── _footer.ejs
│   ├── tasks/
│   │   ├── new.ejs
│   │   ├── show.ejs
│   │   ├── index.ejs
│   │   └── edit.ejs
│   ├── users/
│   │   └── profile.ejs
│   ├── dashboard.ejs
│   ├── error.ejs
│   └── index.ejs
├── .env
├── .gitignore
├── app.js
├── package.json
└── README.md



## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements.

## License

This project is licensed under the ISC License.

## Contact

For questions and feedback, please open an issue on [GitHub](https://github.com/Basseychrist/Task_Management_System/issues).

## Acknowledgments

- Node.js and Express.js documentation
- EJS templating engine
- MongoDB and Mongoose

