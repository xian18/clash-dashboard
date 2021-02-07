import * as React from 'react'
import { NavLink } from 'react-router-dom'
import classnames from 'classnames'
import { useI18n, useVersion, useClashXData } from '@stores'

import './style.scss'
import logo from '@assets/logo.png'
import useSWR from 'swr'

import { StreamReader } from '@lib/streamer'
import * as API from '@lib/request'
import { useObject } from '@lib/hook'
import { SideBarSpeed, formatTraffic } from './store'


interface SidebarProps {
    routes: {
        path: string
        name: string
        noMobile?: boolean
        exact?: boolean
    }[]
}



export default function Sidebar(props: SidebarProps) {
    const { routes } = props
    const { translation } = useI18n()
    const { version, premium, update } = useVersion()
    const { data } = useClashXData()
    const { t } = translation('SideBar')

    // connections
    const [connection, setConnection] = useObject({ uploadTotal: 0, downloadTotal: 0, uploadSpeed: 0, downloadSpeed: 0 })
    const speedStore = React.useMemo(() => new SideBarSpeed(), [])

    useSWR('version', update)

    const navlinks = routes.map(
        ({ path, name, exact, noMobile }) => (
            <li className={classnames('item', { 'no-mobile': noMobile })} key={name}>
                <NavLink to={path} activeClassName="active" exact={!!exact}>{t(name)}</NavLink>
            </li>
        )
    )

    const speed = React.useMemo(() => speedStore.getSpeed(), [connection, setConnection])

    React.useLayoutEffect(() => {
        let streamReader: StreamReader<API.Snapshot> | null = null

        function handleConnection(snapshots: API.Snapshot[]) {
            for (const snapshot of snapshots) {
                speedStore.storeConnection(snapshot)
            }
            setConnection(speedStore.getAll())
        }

        (async function () {
            streamReader = await API.getConnectionStreamReader()
            streamReader.subscribe('data', handleConnection)
        }())

        return () => {
            if (streamReader) {
                streamReader.unsubscribe('data', handleConnection)
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
                <span className="sidebar-speed-text">{`↑ ${formatTraffic(speed.uploadSpeed)}/s`}</span>
                <span className="sidebar-speed-text">{`↓ ${formatTraffic(speed.downloadSpeed)}/s`}</span>
            </div>
            <div className="sidebar-version">
                <span className="sidebar-version-label">Clash{data?.isClashX && 'X'} {t('Version')}</span>
                <span className="sidebar-version-text">{version}</span>
                {premium && <span className="sidebar-version-label">Premium</span>}
            </div>
        </div>
    )
}
