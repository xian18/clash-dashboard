import React, { useEffect } from 'react'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useObject } from '@lib/hook'
import { Modal, Input, Alert } from '@components'
import { useI18n, useAPIInfo, identityAtom } from '@stores'
import { localStorageAtom } from '@stores/request'
import './style.scss'

export default function ExternalController () {
    const { translation } = useI18n()
    const { t } = translation('Settings')
    const { hostname, port, secret, protocol } = useAPIInfo()
    const [identity, setIdentity] = useAtom(identityAtom)
    const [value, set] = useObject({
        protocol: '',
        hostname: '',
        port: '',
        secret: '',
    })

    useEffect(() => {
        set({ hostname, port, secret, protocol })
    }, [hostname, port, secret, protocol, set])

    const setter = useUpdateAtom(localStorageAtom)

    function handleOk () {
        const { hostname, port, secret, protocol } = value
        setter([{ hostname, port, secret, protocol }])
    }

    return (
        <Modal
            show={!identity}
            title={t('externalControllerSetting.title')}
            bodyClassName="external-controller"
            onClose={() => setIdentity(true)}
            onOk={handleOk}
        >
            <Alert type="info" inside={true}>
                <p>{t('externalControllerSetting.note')}</p>
            </Alert>
            <div className="flex items-center">
                <span className="md:my-3 w-14 my-1 font-bold">{t('externalControllerSetting.protocol')}</span>
                <Input
                    align="left"
                    inside={true}
                    value={value.protocol}
                    onChange={protocol => set('protocol', protocol)}
                />
            </div>
            <div className="flex items-center">

                <span className="md:my-3 w-14 my-1 font-bold">{t('externalControllerSetting.host')}</span>

                <Input
                    className="md:my-3 flex-1 my-1"
                    align="left"
                    inside={true}
                    value={value.hostname}
                    onChange={hostname => set('hostname', hostname)}
                />
            </div>
            <div className="flex items-center">
                <div className="md:my-3 w-14 my-1 font-bold">{t('externalControllerSetting.port')}</div>
                <Input
                    className="md:my-3 w-14 my-1 flex-1"
                    align="left"
                    inside={true}
                    value={value.port}
                    onChange={port => set('port', port)}
                />
            </div>
            <div className="flex items-center">
                <div className="md:my-3 w-14 my-1 font-bold">{t('externalControllerSetting.secret')}</div>
                <Input
                    className="md:my-3 w-14 my-1 flex-1"
                    align="left"
                    inside={true}
                    value={value.secret}
                    onChange={secret => set('secret', secret)}
                />
            </div>
        </Modal >
    )
}
