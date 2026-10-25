/* 🤖 Robot: wyłapuje brakujące importy między modułami (no-undef). Uruchamiany przez .github/workflows/test.yml */
const browser=Object.fromEntries(('window document navigator location history screen console setTimeout clearTimeout setInterval clearInterval '+
  'requestAnimationFrame cancelAnimationFrame queueMicrotask structuredClone matchMedia getComputedStyle localStorage sessionStorage indexedDB '+
  'fetch Request Response Headers URL URLSearchParams Blob File FileReader FormData TextEncoder TextDecoder CompressionStream DecompressionStream '+
  'Image ImageBitmap createImageBitmap HTMLCanvasElement OffscreenCanvas crypto atob btoa alert confirm prompt print open scrollTo innerWidth innerHeight '+
  'AbortController MutationObserver ResizeObserver IntersectionObserver CustomEvent Event Notification PushManager ServiceWorkerRegistration caches self Intl').split(' ').map(k=>[k,'readonly']));
const sw=Object.fromEntries('self caches clients fetch Response Request URL console Promise setTimeout clearTimeout AbortController location registration'.split(' ').map(k=>[k,'readonly']));
export default [
  {files:['js/**/*.js','demo/**/*.js'],languageOptions:{ecmaVersion:'latest',sourceType:'module',globals:browser},rules:{'no-undef':'error'}},
  {files:['demo/demo.js'],languageOptions:{sourceType:'script'}},
  {files:['sw.js'],languageOptions:{ecmaVersion:'latest',sourceType:'script',globals:sw},rules:{'no-undef':'error'}},
];
