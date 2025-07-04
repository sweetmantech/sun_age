// start backwards compat, remove in 1.0
export * from "./wallet/ethereum.js";
export const miniAppHostCapabilityList = [
    'wallet.getEthereumProvider',
    'wallet.getSolanaProvider',
    'actions.ready',
    'actions.openUrl',
    'actions.close',
    'actions.setPrimaryButton',
    'actions.addMiniApp',
    'actions.signIn',
    'actions.viewCast',
    'actions.viewProfile',
    'actions.composeCast',
    'actions.viewToken',
    'actions.sendToken',
    'actions.swapToken',
];
