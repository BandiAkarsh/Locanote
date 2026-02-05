export {};

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
    PublicKeyCredential: unknown;
    __PW_TEST__?: boolean;
  }

  var window: Window & typeof globalThis;
  var btoa: (data: string) => string;
  var atob: (data: string) => string;
}
