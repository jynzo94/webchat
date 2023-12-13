import { AppRouter } from '@/server/router'
import { createWSClient, httpBatchLink, wsLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'

export const wsClient = createWSClient({
    url: `ws://localhost:3002`,
    onOpen: () => {
        console.log('nextjs connection open')
    },
    onClose: () => {
        console.log('nextjs connection close')
    }
})

export const trpc = createTRPCNext<AppRouter>({
    config({ ctx }) {
        if (typeof window !== 'undefined') {
            // during client requests
            return {
                links: [
                    // If uncomment socket doesn't work properly???
                    // httpBatchLink({
                    //     url: '/api/trpc'
                    // }),
                    wsLink({
                        client: wsClient
                    })
                ]
            }
        }
        return {
            links: [
                httpBatchLink({
                    url: `http://127.0.0.1:3000/api/trpc`
                }),
                wsLink({
                    client: wsClient
                })
            ]
        }
    },
    ssr: true
})
