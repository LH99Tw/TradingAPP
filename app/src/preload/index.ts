import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('tradingApp', {
  env: 'desktop-dev'
})
