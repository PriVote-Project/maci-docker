#!/bin/bash

if [ $# -eq 0 ]; then
  echo "Starting the API server..."
  node index.js
else
  POLL_ID=$1
  PRIVATE_KEY=$2

  if [ -z "$POLL_ID" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "Usage: docker run <PollId> <CoordinatorPrivateKey>"
    exit 1
  fi

  echo "Generating tally file for Poll ID: $POLL_ID"

  # Step 1: Run mergeMessages
  node build/ts/index.js mergeMessages --poll-id $POLL_ID -r http://127.0.0.1:8545/

  # Step 2: Run mergeSignups
  node build/ts/index.js mergeSignups --poll-id $POLL_ID -r http://127.0.0.1:8545/

  # Step 3: Run genProofs
  node build/ts/index.js genProofs \
    -sk $PRIVATE_KEY \
    -zp zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test.0.zkey \
    -zt zkeys/TallyVotes_10-1-2_test/TallyVotes_10-1-2_test.0.zkey \
    -tw zkeys/TallyVotes_10-1-2_test_js/TallyVotes_10-1-2_test.wasm \
    -pw ./zkeys/ProcessMessages_10-2-1-2_test/ProcessMessages_10-2-1-2_test_js/ProcessMessages_10-2-1-2_test.wasm \
    --poll-id $POLL_ID -w true -t tally-file.json --output proofs/

  # Print success message
  echo "Tally file generated: proofs/tally-file.json"

  # Start the API server after generating the tally file
  echo "Starting the API server..."
  node index.js
fi