module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "http": false,
          "https": false,
          "http2": false,
          "util": false,
          "zlib": false,
          "stream": false,
          "url": false,
          "crypto": false,
          "assert": false,
          "fs": false,
          "path": false,
          "os": false,
          "net": false,
          "tls": false
        }
      }
    }
  }
};
