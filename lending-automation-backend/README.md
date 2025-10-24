# Aave Automation API

## Overview
The Aave Automation API is a Node.js application that allows users to automate their trading strategies on the Aave platform. It provides functionalities for managing leverage, setting stop-loss and take-profit orders, and ensuring users can maintain healthy positions.

## Features
- **Automated Leverage Management**: Automatically adjusts leverage based on price movements with options for auto-repay and auto-boost.
- **Stop Loss**: Automatically closes positions when the price reaches a configured minimum to prevent further losses.
- **Take Profit**: Automatically closes positions when the price reaches a configured maximum to lock in profits.

## Technologies Used
- Node.js
- Express
- MongoDB Atlas (with Mongoose)
- TypeScript

## Project Structure
```
aave-automation-api
├── src
│   ├── app.ts
│   ├── server.ts
│   ├── config
│   │   └── database.ts
│   ├── models
│   │   └── Order.ts
│   ├── controllers
│   │   └── orderController.ts
│   ├── routes
│   │   └── orders.ts
│   ├── services
│   │   └── orderService.ts
│   ├── middleware
│   │   └── errorHandler.ts
│   ├── types
│   │   └── index.ts
│   └── utils
│       └── validators.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd aave-automation-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` template and configure your MongoDB Atlas connection string.

4. Start the application:
   ```
   npm run start
   ```

## Usage
- Use the defined API endpoints to create, read, update, and delete orders.
- Refer to the documentation in the `src/routes/orders.ts` file for specific endpoint details.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.