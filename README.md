# maci-docker

This repository contains the necessary files to build a Docker image for the MACI project. The Docker image supports two workflows:

1. Starting an API server to listen to API requests.
2. Running a command with a specified poll ID and private key.

## Prerequisites

- Docker installed on your machine.
- Node.js installed on your machine (for local development).
- Populate the `.env` file with following environment variables.
  ```bash
  PINATA_JWT=
  ETH_SK=
  ```

## Building the Docker Image

To build the Docker image, navigate to the root directory of the repository and run the following command:

```bash
docker build -t maci-docker .
```

## Usage

## Starting an API server

To start an API server, run the following command:

```bash
docker run -p 3000:3000 maci-docker
```

Following endpoints would be available

### `/hello`

This endpoint is used to check if the server is running. It returns a simple message "Hello World!".

#### Request

- **Method**: `GET`
- **URL**: `/hello`

#### Response

- **Status Code**: `200 OK`
- **Body**: `Hello World!`

### `/generate-tally`

This endpoint is used to generate a tally for a specified poll. It performs several steps to merge messages, merge signups, generate proofs, and pin the resulting tally file to IPFS using Pinata.

#### Request

- **Method**: `POST`
- **URL**: `/generate-tally`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "pollId": "<PollId>",
    "coordinatorPrivateKey": "<CoordinatorPrivateKey>"
  }
  ```

#### Response

- Success: Returns the CID (Content Identifier) of the pinned tally file

```
{
  "cid": "<CID>"
}
```

- Error: Returns an error message

```
{
  "error": "<ErrorMessage>"
}
```

Example:

```bash
curl -X POST http://localhost:3000/generate-tally \
  -H "Content-Type: application/json" \
  -d '{
    "pollId": "1",
    "coordinatorPrivateKey": "your_coordinate_private_key"
  }'
```

### Detailed Workflow

1. **Merge Messages**: Runs the `mergeMessages` command for the specified poll ID.

```bash
node build/ts/index.js mergeMessages --poll-id <PollId>
```

2. **Merge Signups**: Runs the `mergeSignups` command for the specified poll ID.

```bash
node build/ts/index.js mergeSignups --poll-id <PollId>
```

3. **Generate Proof**: Runs the `generateProof` command for the specified poll ID and creates a tally file.

```bash
node build/ts/index.js genProofs -sk <CoordinatorPrivateKey> -zp /path/to/ProcessMessages.zkey -zt /path/to/TallyVotes.zkey -tw /path/to/TallyVotes.wasm -pw /path/to/ProcessMessages.wasm --poll-id <PollId> -w true -t tally-file.json --output proofs/
```

4. **Pin Tally File**: Pins the generated tally file to IPFS using Pinata. Only poll deployer can pin the file, helps in avoiding gas costs of pushing large metadata to the chain.

5. **Return CID**: Returns the CID of the pinned tally file.

## Running a command with a specified poll ID and private key

To run the command with a specified poll ID and private key, provide the poll ID and private key as arguments when running the Docker container:

    ```bash
    docker run maci-docker <PollId> <CoordinatorPrivateKey>
    ```

## Troubleshooting

- If you encounter an error while building the Docker image, try running the following command to remove all Docker images:

  ```bash
  docker system prune -a
  ```

  Also ensure that you have provided the correct arguments and that the Docker container has the necessary permissions to access the required files.

## Contributing

Feel free to contribute to this repository by opening an issue or a pull request. Please ensure that your pull request follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

```
