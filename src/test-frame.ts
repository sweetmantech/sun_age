import { type FrameContext } from '@farcaster/frame-core/context';

// Example usage of FrameContext
const frameContext: FrameContext = {
  client: {
    clientFid: 123,
    added: true,
    safeAreaInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  },
  user: {
    fid: 456,
    username: 'testuser',
    displayName: 'Test User',
    pfpUrl: 'https://example.com/pfp.jpg'
  },
  location: {
    type: 'cast_embed',
    embed: 'test-embed',
    cast: {
      fid: 789,
      hash: 'test-hash'
    }
  }
};

export { frameContext }; 