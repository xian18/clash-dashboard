export function createAsyncSingleton<T>(fn: () => Promise<T>): (reCreate?: Boolean) => Promise<T> {
    let promise: Promise<T> | null = null

    return async function (reCreate = false) {
        if (promise && !reCreate) {
            return promise
        }
        promise = fn()
        return promise
            .catch(e => {
                promise = null
                throw e
            })
    }
}
