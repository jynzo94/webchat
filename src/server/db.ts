import mongoose from 'mongoose'

const connectToDb = async () => {
    try {
        return await mongoose.connect('mongodb://127.0.0.1:27017/chat-db')
    } catch (e) {
        console.error('Database connection error', e)
    }
}

export { connectToDb }
