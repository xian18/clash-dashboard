import * as API from '@lib/request'
import { useState, useMemo, useCallback, useRef } from 'react'

export type Connection = API.Connections & { completed?: boolean, uploadSpeed: number, downloadSpeed: number }

class SideStore {
    protected connections = new Map<string, Connection>()

    appendToSet(connections: API.Connections[]) {
        const mapping = connections.reduce(
            (map, c) => map.set(c.id, c), new Map<string, API.Connections>()
        )
        for (const id of this.connections.keys()) {
            if (!mapping.has(id)) {
                this.connections.delete(id)
            }
        }
        for (const id of mapping.keys()) {
            if (!this.connections.has(id)) {
                this.connections.set(id, { ...mapping.get(id)!, uploadSpeed: 0, downloadSpeed: 0 })
                continue
            }

            const c = this.connections.get(id)!
            const n = mapping.get(id)!
            this.connections?.set(id, { ...n, uploadSpeed: n.upload - c.upload, downloadSpeed: n.download - c.download })
        }
    }


    getConnections() {
        return [...this.connections.values()]
    }
}

export function useConnections() {
    const store = useMemo(() => new SideStore(), [])
    const [connections, setConnections] = useState<Connection[]>([])
    // const shouldFlush = useRef(true)

    const feed = useCallback(function (connections: API.Connections[]) {
        store.appendToSet(connections)
        // if(shouldFlush.current)
        setConnections(store.getConnections())
        // shouldFlush.current=!shouldFlush.current
    }, [store])

    return { connections, feed }
}
