# P2P Collaborative Editor:

## 1. Start the signalling server
```bash

cd node_module
cd y-webrtc
PORT=4444 node ./bin/server.js

```

## 2. Start the client
```bash
npm run dev
```

## Connection details

The editors connect to a P2P room via a signalling server. For this project:

Room: `abhinavs-test-room`
Signalling Server: `ws://localhost:4444`

Start the client on to different browser or two different instances to work together.
