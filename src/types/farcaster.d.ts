declare module '@farcaster/frame-core' {
  export type * from '@farcaster/frame-core/src/types';
  export type { DEFAULT_READY_OPTIONS, ReadyOptions } from '@farcaster/frame-core/src/actions/Ready';
  export type SignInOptions = import('@farcaster/frame-core/src/actions/SignIn').SignInOptions;
  export type * from '@farcaster/frame-core/src/wallet/ethereum';

  export type SetPrimaryButtonOptions = {
    text: string
    loading?: boolean
    disabled?: boolean
    hidden?: boolean
  }

  export type SetPrimaryButton = (options: SetPrimaryButtonOptions) => void

  export type MiniAppHostCapability =
    | 'wallet.getEthereumProvider'
    | 'wallet.getSolanaProvider'
    | 'actions.ready'
    | 'actions.openUrl'
    | 'actions.close'
    | 'actions.setPrimaryButton'
    | 'actions.addMiniApp'
    | 'actions.signIn'
    | 'actions.viewCast'
    | 'actions.viewProfile'
    | 'actions.composeCast'
    | 'actions.viewToken'
    | 'actions.sendToken'
    | 'actions.swapToken'

  export type GetCapabilities = () => Promise<MiniAppHostCapability[]>
  export type GetChains = () => Promise<string[]>

  export type FrameClientEvent = {
    event: string
    [key: string]: any
  }

  export const DEFAULT_READY_OPTIONS: ReadyOptions
} 