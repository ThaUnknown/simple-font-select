import App from '../src/simple-font-select.svelte'

const app = new App({
  target: document.querySelector('div'),
  props: {
    class: 'form-control bg-dark shadow-lg w-500 border-0'
  }
})

navigator.serviceWorker.register('./sw.js')

export default app
