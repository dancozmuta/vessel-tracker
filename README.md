# VesselTracker

# INTRODUCTION
Vessel Tracker is a web application designed to display maritime vessel data dynamically on a map interface. It utilizes Angular 17.3.3 for frontend development and integrates with a GraphQL API for real-time maritime data. This project was created by Dan Cozmuta as part of a coding challenge.

# FEATURES 
Real-time display of vessel positions on a map.
Detailed vessel information such as dimensions, type, flag, and more.
Ability to filter vessels by type.
Responsive design accommodating various viewports.

# TECHNOLOGY STACK
Angular: Version 17.3.3
Leaflet: For mapping functionalities.
GraphQL: For API integration.

# SETUP AND INSTALLATION

## 1.Clone the repository:
git clone https://github.com/dancozmuta/vessel-tracker

## 2.Install dependencies:
npm install

## 3.Configure Environment (!!!! IMPORTANT)

Before running the application, you must configure the environment files. 

Rename the environment.template.ts to environment.ts and environment.prod.template.ts to environment.prod.ts, then update them with your specific configurations.

EXAMPLE: 

// environment.ts

export const environment = {
  production: false,
  bearerToken: 'YOUR_BEARER_TOKEN'
};

// environment.prod.ts

export const environment = {
  production: true,
  bearerToken: 'YOUR_BEARER_TOKEN'
};

# DEVELOPMENT COMMANDS
ng serve

Visit http://localhost:4200/ to view the application. To test on mobile devices, use:
ng serve --host 0.0.0.0

# Author
Dan Cozmuta

# Acknowledgments
Angular CLI Documentation
Leaflet.js
GraphQL

