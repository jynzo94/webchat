import { EventEmitter } from 'events'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'
import { dbProcedure, procedure, router } from './trpc'
import chatModel, { IChat } from '../models/chat'

const ee = new EventEmitter()

export const appRouter = router({
    getAll: dbProcedure.query(async () => {
        const chats: IChat[] = await chatModel.find().sort({ created: -1 })
        return [...chats].reverse()
    }),
    onAdd: procedure.subscription(() => {
        return observable<IChat>((emit) => {
            const onAdd = (data: IChat) => {
                emit.next(data)
            }
            ee.on('add', onAdd)
            return () => {
                ee.off('add', onAdd)
            }
        })
    }),
    add: dbProcedure
        .input(
            z.object({
                body: z.string().min(1),
                userName: z.string().min(1)
            })
        )
        .mutation(async (opts) => {
            const chat: IChat = {
                body: opts.input.body,
                userName: opts.input.userName
            }
            const chatModelData = await chatModel.create(chat)
            ee.emit('add', chat)
            return chatModelData
        })
})

export type AppRouter = typeof appRouter
