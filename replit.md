# Legacy Full Stack Development Certification Portfolio

## Overview
This is a portfolio website showcasing a comprehensive collection of FreeCodeCamp Legacy Full Stack Development Certification projects by Julius Martin Banda. The portfolio serves as a central hub to access and explore multiple projects across different domains including web design, front-end libraries, data visualization, back-end APIs, security, quality assurance, Python programming, databases, and machine learning.

## Current State
Currently running the **Back End APIs** project in the Replit environment with:
- Express.js server running on port 5000
- Multiple API microservices: Timestamp, Request Header Parser, URL Shortener, Exercise Tracker, File Metadata
- Proper deployment configuration for production use

The portfolio landing page is also available (index.html, styles.css, server.js in root) but the Back End APIs workflow is currently active.

## Project Architecture

### Structure
```
/
├── index.html           - Main portfolio landing page
├── styles.css          - Portfolio styling
├── server.js           - Express server (serves static files)
├── package.json        - Node.js dependencies
├── tribute-page/       - Responsive Web Design projects
├── survey-form/
├── product-landing-page/
├── technical-documentation-page/
├── personal-portfolio-webpage/
├── front-end-libraries/ - React-based projects
├── data-visualization/ - D3.js visualization projects
├── back-end-apis/      - Node.js/Express API projects
├── book-trading-club/  - Full-stack applications
├── nightlife-app/
├── pinterest-clone/
├── stock-chart-app/
├── voting-app/
├── information-security/ - Security projects
├── quality-assurance/   - QA projects with testing
├── scientific-computing/ - Python scientific computing
├── data-analysis/       - Python data analysis
├── machine-learning/    - ML projects
├── relational-database/ - Database projects
└── [other projects]
```

### Technologies
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), React, D3.js
- **Backend**: Node.js, Express.js, Python
- **Server**: Express.js serving static files on 0.0.0.0:5000
- **Deployment**: Autoscale configuration for production

## Running the Portfolio

### Development
The portfolio server is configured to run automatically via the "Portfolio Server" workflow:
- Command: `npm start`
- Port: 5000
- Host: 0.0.0.0 (required for Replit proxy)

### Manual Start
```bash
npm start
```

The server will start on http://0.0.0.0:5000

## Project Categories

### 1. Responsive Web Design (Static HTML/CSS/JS)
Projects can be accessed directly through the portfolio or by opening their `index.html` files.

### 2. Front-End Libraries (React)
Interactive applications built with React, accessible through the portfolio.

### 3. Data Visualization (D3.js)
Interactive charts and graphs using D3.js library.

### 4. Full-Stack Applications (Node.js + Frontend)
Complete applications with backend APIs. These are listed in the portfolio with setup instructions:
- Back End APIs
- Book Trading Club
- Nightlife App
- Pinterest Clone
- Stock Chart App
- Voting App

Each requires individual setup:
```bash
cd [project-directory]
npm install
npm start
```

### 5. Python Projects
Scientific computing, data analysis, and machine learning projects:
- Scientific Computing
- Data Analysis
- Machine Learning
- Calculators and tools

### 6. Database Projects
Relational database projects with SQL and PostgreSQL.

## Recent Changes
- **December 8, 2025**: Initial setup for Replit environment
  - Created portfolio landing page (index.html, styles.css)
  - Set up Express.js server to serve the portfolio
  - Configured workflow for port 5000 with webview output
  - Configured autoscale deployment
  - Installed Express.js dependency

## User Preferences
None specified yet.

## Notes
- The portfolio is a collection of independent projects from FreeCodeCamp certifications
- Each project can run independently; the main portfolio serves as a showcase
- Static projects (HTML/CSS/JS) are directly accessible
- Full-stack applications require separate server setup
- Python projects require Python environment and dependencies
- Database projects require PostgreSQL setup

## Deployment
The portfolio is configured for autoscale deployment using:
```bash
node server.js
```

This serves the portfolio landing page and all static projects. Individual full-stack applications would need their own deployment configuration if needed separately.
