import { useEffect, useState } from 'react'
import { AppRouter } from '../server/router'
import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client'
import styles from '../styles/index.module.css'
import { trpc } from '@/utils/trpc'
import nameGenerator from 'boring-name-generator'

const wsClient = createWSClient({
    url: `ws://localhost:3002`,
    onOpen: () => {
        console.log('nextjs connection open')
    },
    onClose: () => {
        console.log('nextjs connection open')
    }
})

const client = createTRPCProxyClient<AppRouter>({
    links: [
        wsLink({
            client: wsClient
        })
    ]
})

type ChatEntity = {
    _id?: string
    body: string
    userName: string
}

export default function IndexPage() {
    const [input, setInput] = useState('')
    const chatsQuery = trpc.getAll.useQuery()
    const [userName, setUserName] = useState('')
    const [chats, setChats] = useState<ChatEntity[] | undefined>(
        chatsQuery.data
    )

    useEffect(() => {
        setUserName(
            nameGenerator()
                .spaced.split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        )

        client.onAdd.subscribe(undefined, {
            onData: onAdd
        })

        return () => {
            wsClient.close()
        }
    }, [])

    const onAdd = (data: ChatEntity) => {
        window.scrollTo(0, document.body.scrollHeight)
        setChats((pre) => {
            if (pre) {
                return [...pre, data]
            }
        })
    }

    const onClickSend = () => {
        setInput('')
        client.add.mutate({ body: input, userName: userName })
    }

    const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.header}>Welcome, {userName}!</h1>
            <div className={styles.chats}>
                {chats &&
                    chats.map((chat, i) => {
                        return (
                            <div key={i} className={styles.chatRow}>
                                <div className={styles.userName}>
                                    {chat.userName === userName
                                        ? 'Me'
                                        : chat.userName}
                                </div>
                                <div className={styles.chatBody}>
                                    {chat.body}
                                </div>
                            </div>
                        )
                    })}
                <div className={styles.hiddenRow} />
            </div>
            <div className={styles.inputsWrapper}>
                <input
                    className={styles.input}
                    value={input}
                    onChange={onChangeInput}
                />
                <button
                    className={styles.button}
                    onClick={onClickSend}
                    disabled={input.length === 0}
                >
                    Send
                </button>
            </div>
        </div>
    )
}
