import { appRouter } from './router'
import ws from 'ws'
import { createContext } from 'react'
import { applyWSSHandler } from '@trpc/server/adapters/ws'

const wss = new ws.Server({
    port: 3002
})
const handler = applyWSSHandler({ wss, router: appRouter, createContext })

wss.on('connection', (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`)
    ws.once('close', () => {
        console.log(`➖➖ Connection close (${wss.clients.size})`)
    })
    ws.once('open', () => {
        console.log(`➖➖ Connection open (${wss.clients.size})`)
    })
})

console.log('✅ WebSocket Server listening on ws://localhost:3002')

process.on('SIGTERM', () => {
    console.log('SIGTERM')
    handler.broadcastReconnectNotification()
    wss.close()
})
