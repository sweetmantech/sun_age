import type { FrameContext } from '@farcaster/frame-core';

// Test type usage
const testContext: FrameContext = {
  client: {
    clientFid: 123,
    added: true
  },
  user: {
    fid: 456,
    username: 'testuser'
  }
};

console.log('Type import successful:', testContext); 