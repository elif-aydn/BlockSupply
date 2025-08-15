require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
    paths: {
    sources: "./contracts",       // Kaynak dosyalar
    tests: "./test",              // Testler
    cache: "./cache",
    artifacts: "./artifacts"
  },

};
