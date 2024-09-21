// index.js
const express = require("express");
const { exec } = require("child_process");

const app = express();
const port = 3000;

app.use(express.json());

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

app.post("/generate-tally", (req, res) => {
  const pollId = req.body.pollId;

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
            `node build/ts/index.js genProofs -sk macisk.ae901d364c0417c82c8eff34c3ca9aeab54608ca15aa6d493b912b08ad99e0b6 -zp zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey -zt zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey -tw zkeys/TallyVotes_10-1-2_test_js/TallyVotes_10-1-2_test.wasm -pw ./zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_js/ProcessMessages_10-2-1-2_test.wasm --poll-id ${pollId} -w true -t tally-file.json --output proofs/`,
            (error, stdout, stderr) => {
              if (error) {
                console.error(`Error in genProofs: ${stderr}`);
                return res.status(500).send(`Error in genProofs: ${stderr}`);
              }

              console.log(`genProofs output: ${stdout}`);
              return res.download("tally-file.json"); // Download the tally file
            },
          );
        },
      );
    },
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
