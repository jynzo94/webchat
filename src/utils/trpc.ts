import { AppRouter } from '@/server/router'
import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
function getBaseUrl() {
    if (typeof window !== 'undefined') {
        return ''
    }

    return `http://127.0.0.1:3000`
}
export const trpc = createTRPCNext<AppRouter>({
    config(opts) {
        const { ctx } = opts
        if (typeof window !== 'undefined') {
            // during client requests
            return {
                links: [
                    httpBatchLink({
                        url: '/api/trpc'
                    })
                ]
            }
        }
        return {
            links: [
                httpBatchLink({
                    // The server needs to know your app's full url
                    url: `${getBaseUrl()}/api/trpc`,
                    /**
                     * Set custom request headers on every request from tRPC
                     * @link https://trpc.io/docs/v10/header
                     */
                    headers() {
                        if (!ctx?.req?.headers) {
                            return {}
                        }
                        // To use SSR properly, you need to forward client headers to the server
                        // This is so you can pass through things like cookies when we're server-side rendering
                        return {
                            cookie: ctx.req.headers.cookie
                        }
                    }
                })
            ]
        }
    },
    ssr: true
})