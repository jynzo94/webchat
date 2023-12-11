import { model, Schema, models } from 'mongoose'

export interface IChat {
    _id?: string
    body: string
    created?: Date
    userName: string
}

const chatSchema = new Schema<IChat>({
    body: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        required: false,
        default: Date.now
    },
    userName: {
        type: String,
        required: true
    }
})

const chatModel = models.chat ?? model('chat', chatSchema)

export default chatModel
