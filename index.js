// index.js
const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const axios = require("axios");
// dotenv
require("dotenv").config();
const app = express();
const port = 3000;

app.use(express.json());

app.get("/hello", (req, res) => {
  // if (process.env.PINATA_JWT == null) {
  //   return res.status(500).send("PINATA_JWT is not set");
  // }
  res.send("Hello World!");
  // fs.readFile(
  //   "/home/wsl-ubuntu/blockchain/ethsingapore/maci-docker/tally-file.json",
  //   "utf8",
  //   (err, data) => {
  //     if (err) {
  //       console.error(`Error reading tally-file.json: ${err}`);
  //       return res
  //         .status(500)
  //         .send(`Error reading tally-file.json: ${err.message}`);
  //     }

  //     const jsonData = JSON.parse(data); // Parse the JSON data

  //     // Update the Pinata API call to use these variables
  //     axios
  //       .post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonData, {
  //         headers: {
  //           Authorization: `Bearer ${process.env.PINATA_JWT}`, // Use JWT for
  //           // authorization
  //         },
  //       })
  //       .then((response) => {
  //         const cid = response.data.IpfsHash; // Get the CID from the response
  //         return res.json({ cid }); // Send the CID as a response
  //       })
  //       .catch((error) => {
  //         console.error(`Error pinning JSON to Pinata: ${error}`);
  //         return res
  //           .status(500)
  //           .send(`Error pinning JSON to Pinata: ${error.message}`);
  //       });
  //   }
  // );
});

app.post("/generate-tally", (req, res) => {
  const pollId = req.body.pollId;
  const coordinatorPrivateKey = req.body.coordinatoreKey;
  if (!pollId) {
    return res.status(400).send("PollId is required");
  }

  // Step 1: Run mergeMessages
  exec(
    `node build/ts/index.js mergeMessages --poll-id ${pollId} -r http://127.0.0.1:8545/`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error in mergeMessages: ${stderr}`);
        return res.status(500).send(`Error in mergeMessages: ${stderr}`);
      }

      console.log(`mergeMessages output: ${stdout}`);

      // Step 2: Run mergeSignups
      exec(
        `node build/ts/index.js mergeSignups --poll-id ${pollId} -r http://127.0.0.1:8545/`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error in mergeSignups: ${stderr}`);
            return res.status(500).send(`Error in mergeSignups: ${stderr}`);
          }

          console.log(`mergeSignups output: ${stdout}`);

          // Step 3: Run genProofs
          exec(
            `node build/ts/index.js genProofs -sk ${coordinatorPrivateKey} -zp /home/wsl-ubuntu/blockchain/ethsingapore/privote-contracts/zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey -zt /home/wsl-ubuntu/blockchain/ethsingapore/privote-contracts/zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey -tw /home/wsl-ubuntu/blockchain/ethsingapore/privote-contracts/zkeys/TallyVotes_10-1-2_test_js/TallyVotes_10-1-2_test.wasm -pw .//home/wsl-ubuntu/blockchain/ethsingapore/privote-contracts/zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_js/ProcessMessages_10-2-1-2_test.wasm --poll-id ${pollId} -w true -t tally-file.json --output proofs/`,
            (error, stdout, stderr) => {
              if (error) {
                console.error(`Error in genProofs: ${stderr}`);
                return res.status(500).send(`Error in genProofs: ${stderr}`);
              }

              console.log(`genProofs output: ${stdout}`);

              // Step 4: Read JSON data from tally-file.json
              fs.readFile("tally-file.json", "utf8", (err, data) => {
                if (err) {
                  console.error(`Error reading tally-file.json: ${err}`);
                  return res
                    .status(500)
                    .send(`Error reading tally-file.json: ${err.message}`);
                }

                const jsonData = JSON.parse(data); // Parse the JSON data

                // Use environment variables for Pinata API keys
                // const PINATA_API_KEY = process.env.PINATA_API_KEY;
                // const PINATA_SECRET_API_KEY =
                //     process.env.PINATA_SECRET_API_KEY;

                // Update the Pinata API call to use these variables
                axios
                  .post(
                    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                    jsonData,
                    {
                      headers: {
                        Authorization: `Bearer ${process.env.PINATA_JWT}`, // Use JWT for
                        // authorization
                      },
                    }
                  )
                  .then((response) => {
                    const cid = response.data.IpfsHash; // Get the CID from the response
                    return res.json({ cid }); // Send the CID as a response
                  })
                  .catch((error) => {
                    console.error(`Error pinning JSON to Pinata: ${error}`);
                    return res
                      .status(500)
                      .send(`Error pinning JSON to Pinata: ${error.message}`);
                  });
              });
            }
          );
        }
      );
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
