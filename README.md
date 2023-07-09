# Warehouse Management System

This project is a small stock management application built as part of an interview task. The application provides a GraphQL API powered by Apollo Server, which interacts with a PostgreSQL database. The API includes various queries to manage warehouses, products, and stock operations. Some of the calculation operations are performed by calling an external REST API ([math.js web service](https://api.mathjs.org/)).

## Technologies Used
- TypeScript
- NestJS
- GraphQL
- Apollo Server
- PostgreSQL

## Project Features
- List of Warehouses: Retrieve a detailed list of warehouses including name, description and capacity of a warehouse.
- List of Products: Retrieve a detailed list of products including name, description and size of a product.
- List of Inventory Movemebts Operations: Retrieve a detailed list of stock operations, including date, import/export, amount, warehouse, product and user.
- Pagination: The API supports pagination for all list queries.
- Product Management: Manage the product inventory by adding, editing, and removing existing products. Products can be marked as hazardous or non-hazardous. 
- Warehouse Management: Manage the warehouse inventory by adding, editing, and removing existing warehouses. 
- Stock Operations: Perform import and export operations to move products into and out of warehouses. Some rules apply to the operations:
    - Imports/Exports can be in the future or the past.
    - The amount of the operation must be a positive number and cannot be zero.
    - The amount of the import operation cannot exceed the free space of the warehouse.
    - The amount of the export operation cannot exceed the available stock of the product.
    - Hazardous products cannot be stored in the same warehouse as non-hazardous products.
- Current Stock: Obtain the current stock amount per warehouse and optionally can be requested to a specific date and the overall free stock space remaining.
- Historic Operations: Retrieve a historical list of imports and exports based on specific period and/or warehouses.
- User Management: Manage the users of the system by registering users.
- Authorization: The API is protected by a JWT token. The token can be obtained by calling the login mutation. The token is valid for 1 hour. The token is required to perform import/export operations.

## Installation

```bash
$ npm install
```

## Setup PostgreSQL and Adminer

```bash
$ npm docker-compose up
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Authors

This Warehouse Management System project was implemented by Miroslava Strateva as part of an interview task.
Feel free to reach out with any questions or feedback.