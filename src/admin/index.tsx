import * as React from 'react'
import * as ReactDOM from 'react-dom'

import App from './App'
import { currentTheme } from '../storage'

window.addEventListener('DOMContentLoaded', async () => {
  ReactDOM.render(<App />, document.getElementById('root') as HTMLElement)
  document.body.classList.add(await currentTheme())
})
