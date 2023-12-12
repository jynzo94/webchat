import { KeyboardEvent, useEffect, useRef, useState } from 'react'
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
    const chatsRef = useRef<HTMLDivElement | null>(null)
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

    useEffect(() => {
        chatsRef.current?.scrollTo(0, 9999)
    }, [chats])

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

    const send = () => {
        setInput('')
        client.add.mutate({ body: input, userName: userName })
    }

    const onAdd = (data: ChatEntity) => {
        setChats((pre) => {
            if (pre) {
                return [...pre, data]
            }
        })
    }

    const onClickSend = () => {
        send()
    }

    const onChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            send()
        }
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.header}>Welcome, {userName}!</h1>
            <div className={styles.chats} ref={chatsRef}>
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
            </div>
            <form className={styles.form}>
                <textarea
                    className={styles.textarea}
                    value={input}
                    onChange={onChangeTextArea}
                    onKeyDown={onKeyDown}
                    ref={textAreaRef}
                />
                <button
                    className={styles.button}
                    onClick={onClickSend}
                    disabled={input.length === 0}
                >
                    Send
                </button>
            </form>
        </div>
    )
}
