import * as React from 'react'
import { NavLink } from 'react-router-dom'
import classnames from 'classnames'
import { useI18n, useVersion, useClashXData } from '@stores'

import './style.scss'
import logo from '@assets/logo.png'
import useSWR from 'swr'

import { StreamReader } from '@lib/streamer'
import * as API from '@lib/request'
import { useConnections } from '@containers/Connections/store'


interface SidebarProps {
    routes: {
        path: string
        name: string
        noMobile?: boolean
        exact?: boolean
    }[]
}

function formatTraffic(num: number) {
    const s = ['B', 'KB', 'MB', 'GB', 'TB']
    let idx = 0
    while (~~(num / 1024) && idx < s.length) {
        num /= 1024
        idx++
    }

    return `${idx === 0 ? num : num.toFixed(2)} ${s[idx]}`
}


function formatSpeed(upload: number, download: number) {
    switch (true) {
        case upload === 0 && download === 0:
            return '-'
        case upload !== 0 && download !== 0:
            return `↑ ${formatTraffic(upload)}/s ↓ ${formatTraffic(download)}/s`
        case upload !== 0:
            return `↑ ${formatTraffic(upload)}/s`
        default:
            return `↓ ${formatTraffic(download)}/s`
    }
}

export default function Sidebar(props: SidebarProps) {
    const { routes } = props
    const { translation } = useI18n()
    const { version, premium, update } = useVersion()
    const { data } = useClashXData()
    const { t } = translation('SideBar')

    // connections
    const { connections, feed, save, toggleSave } = useConnections()

    useSWR('version', update)

    const navlinks = routes.map(
        ({ path, name, exact, noMobile }) => (
            <li className={classnames('item', { 'no-mobile': noMobile })} key={name}>
                <NavLink to={path} activeClassName="active" exact={!!exact}>{t(name)}</NavLink>
            </li>
        )
    )

    const speed = React.useMemo(() => connections.map(c => ({
        upload: c.uploadSpeed,
        download: c.downloadSpeed
    })).reduce((prev, cur) => ({
        upload: prev.upload + cur.upload,
        download: prev.download + cur.download
    }), { upload: 0, download: 0 }), [connections])

    React.useLayoutEffect(() => {
        let streamReader: StreamReader<API.Snapshot> | null = null

        function handleConnection(snapshots: API.Snapshot[]) {
            for (const snapshot of snapshots) {
                feed(snapshot.connections)
            }
        }

        (async function () {
            streamReader = await API.getConnectionStreamReader()
            streamReader.subscribe('data', handleConnection)
        }())

        return () => {
            if (streamReader) {
                streamReader.unsubscribe('data', handleConnection)
                streamReader.destory()
            }
        }
    }, [])



    return (
        <div className="sidebar">
            <img src={logo} alt="logo" className="sidebar-logo" />
            <ul className="sidebar-menu">
                {navlinks}
            </ul>
            <div className="sidebar-speed">
                <span className="sidebar-speed-label">{t('Speed')}</span>
                <span className=".sidebar-speed-text">{`↑ ${formatTraffic(speed.upload)}/s`}</span>
                <span className=".sidebar-speed-text">{`↓ ${formatTraffic(speed.download)}/s`}</span>
            </div>
            <div className="sidebar-version">
                <span className="sidebar-version-label">Clash{data?.isClashX && 'X'} {t('Version')}</span>
                <span className="sidebar-version-text">{version}</span>
                {premium && <span className="sidebar-version-label">Premium</span>}
            </div>
        </div>
    )
}
