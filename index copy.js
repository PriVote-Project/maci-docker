const express = require('express');
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Pinata client
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

app.get('/upload-tally', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'proofs', 'tally-file.json');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Tally file not found' });
    }

    const readableStream = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: {
        name: `Tally-${Date.now()}.json`,
      },
    };

    const result = await pinata.pinFileToIPFS(readableStream, options);
    
    res.json({ cid: result.IpfsHash });
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    res.status(500).json({ error: 'Failed to upload tally file' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
