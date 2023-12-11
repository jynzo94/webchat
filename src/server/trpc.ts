import { initTRPC } from '@trpc/server'
import { connectToDb } from './db'

const t = initTRPC.create()

export const router = t.router
export const procedure = t.procedure
export const middleware = t.middleware

const connectToDbMiddleware = middleware(async (opts) => {
    const { ctx } = opts

    const db = await connectToDb()

    const result = await opts.next({
        ctx: {
            db,
            ...ctx
        }
    })

    db?.connection.close()

    return result
})

export const dbProcedure = procedure.use(connectToDbMiddleware)
