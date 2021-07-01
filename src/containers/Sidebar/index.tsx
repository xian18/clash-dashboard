import * as React from 'react'
import { NavLink } from 'react-router-dom'
import classnames from 'classnames'
import { useI18n, useVersion, useClashXData, useConnectionStreamReader } from '@stores'

import logo from '@assets/logo.png'
import './style.scss'
import * as API from '@lib/request'
import { formatTraffic, SideBarSpeed } from './store'
import { useObject } from '@lib/hook'

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
    const { version, premium } = useVersion()
    const { data } = useClashXData()
    const { t } = translation('SideBar')

    const navlinks = routes.map(
        ({ path, name, exact, noMobile }) => (
            <li className={classnames('item', { 'no-mobile': noMobile })} key={name}>
                <NavLink to={path} activeClassName="active" exact={!!exact}>{t(name)}</NavLink>
            </li>
        )
    )

    // connections
    const [connection, setConnection] = useObject({ uploadTotal: 0, downloadTotal: 0, uploadSpeed: 0, downloadSpeed: 0 })
    const speedStore = React.useMemo(() => new SideBarSpeed(), [])
    const speed = React.useMemo(() => speedStore.getSpeed(), [speedStore, connection, setConnection])
    const connStreamReader = useConnectionStreamReader()

    React.useLayoutEffect(() => {


        function handleConnection(snapshots: API.Snapshot[]) {
            for (const snapshot of snapshots) {
                speedStore.storeConnection(snapshot)
            }
            setConnection(speedStore.getAll())
        }

        connStreamReader?.subscribe('data', handleConnection)
        return () => {
            connStreamReader?.unsubscribe('data', handleConnection)
            connStreamReader?.destory()
        }
    }, [connStreamReader, speedStore, setConnection])

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
