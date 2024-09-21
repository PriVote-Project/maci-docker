import '@nomicfoundation/hardhat-toolbox';

import {config as envConfig} from 'dotenv';
import type {HardhatUserConfig} from 'hardhat/config';
import path from 'path';

import {DEFAULT_ETH_PROVIDER, DEFAULT_ETH_SK} from './ts/utils/defaults';

envConfig();

const parentDir = __dirname.includes('build') ? '..' : '';

const config: HardhatUserConfig = {
  defaultNetwork: 'localhost',

  networks: {
    localhost: {
      url: process.env.ETH_PROVIDER || DEFAULT_ETH_PROVIDER,
      accounts: [process.env.ETH_SK || DEFAULT_ETH_SK],
      loggingEnabled: false,
    },
    holesky: {
      url: 'https://endpoints.omniatech.io/v1/eth/holesky/public',
      accounts: [process.env.ETH_SK || DEFAULT_ETH_SK],
      loggingEnabled: false,
    },
  },
  paths: {
    sources: path.resolve(__dirname, parentDir, '../contracts/contracts'),
    artifacts: path.resolve(__dirname, parentDir, '../contracts/artifacts'),
  },
};

export default config;
