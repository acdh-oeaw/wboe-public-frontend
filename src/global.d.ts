
declare interface process {
  env : {
    [key: string]: string
  }
}

declare module "*.wasm" {
  const value: ArrayBuffer
  export default value;
}

declare module 'vue-input-autowidth'
declare module 'promise-worker-transferable'
declare module '@rgrove/parse-xml'
declare module 'vuewordcloud'
declare module 'random-words'
declare module 'vue-codemirror-lite'
declare module 'file-saver'
