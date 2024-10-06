# CHEDDA Oracle API Server

This API server provides an endpoint to retrieve the USD value of a specified token contract address on the Solana blockchain, along with the token's symbol using the Metaplex SDK.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Example Request](#example-request)
- [Logging](#logging)
- [Graceful Shutdown](#graceful-shutdown)
- [Contributing](#contributing)
- [License](#license)

## Features

- Fetches token prices from both Jupiter and Raydium.
- Calculates the average price with statistical validation.
- Handles errors gracefully and logs them for debugging.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/solana-api-server.git
   cd solana-api-server
   ```

2. Install the necessary dependencies:

   ```bash
   npm install
   ```

### Configuration

You may want to configure the port number for the server. This can be done by modifying the port number when instantiating the `ApiServer` class.

### Usage

To run the API server, execute the following command:

```bash
node dist/index.js
```

**Note:** Make sure to compile the TypeScript code to JavaScript if you are using TypeScript.

## API Endpoints

### GET /usd-value/:contract

Retrieves the USD value of a specified token contract address.

#### Parameters

- `contract`: The mint address of the token whose USD value is to be retrieved.

#### Response

- **Success (200)**: Returns the USD value as a JSON number.
- **Error (500)**: Returns an error message in case of an internal server error.

### Example Request

```bash
GET http://localhost:PORT/usd-value/YOUR_TOKEN_MINT_ADDRESS
```

### Example Response

**Success Response:**

```json
{
  "value": 123.456789
}
```

**Error Response:**

```json
{
  "error": "Internal Server Error"
}
```

## Logging

The server uses `tslog` for logging. You can see logs related to the API calls in the console, including the fetched token symbol and its price.

## Graceful Shutdown

The API server supports graceful shutdowns, allowing for pending requests to finish before the server closes. You can specify a timeout for the shutdown process. If the server does not close in the specified time, it will terminate forcefully.

### Example Usage of Graceful Shutdown

```typescript
const apiServer = new ApiServer(3000)

process.on('SIGINT', async () => {
  await apiServer.close(10000) // Wait up to 10 seconds for graceful shutdown
  process.exit(0)
})
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

