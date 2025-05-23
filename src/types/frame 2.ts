export interface FrameContext {
  client: {
    added: boolean;
    clientFid: number;
  };
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
  };
} 