import * as API from '@lib/request'

export class SideBarSpeed {
    protected connection = { uploadTotal: 0, downloadTotal: 0, uploadSpeed: 0, downloadSpeed: 0 }

    storeConnection({ uploadTotal, downloadTotal }: API.Snapshot) {
        this.connection.uploadSpeed = uploadTotal - this.connection.uploadTotal
        this.connection.uploadTotal = uploadTotal
        this.connection.downloadSpeed = downloadTotal - this.connection.downloadTotal
        this.connection.downloadTotal = downloadTotal
    }

    getSpeed() {
        return { uploadSpeed: this.connection.uploadSpeed, downloadSpeed: this.connection.downloadSpeed }
    }

    getAll() {
        // console.log(this.connection)
        return this.connection
    }
}

export function formatTraffic(num: number) {
    const s = ['B', 'KB', 'MB', 'GB', 'TB']
    let idx = 0
    while (~~(num / 1024) && idx < s.length) {
        num /= 1024
        idx++
    }

    return `${idx === 0 ? num : num.toFixed(2)} ${s[idx]}`
}