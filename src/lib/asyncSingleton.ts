export function createAsyncSingleton<T> (fn: () => Promise<T>): (reCreate?: Boolean) => Promise<T> {
    let promise: Promise<T> | null = null

    return async function (reCreate = false) {
        if (promise && !reCreate) {
            return await promise
        }
        promise = fn()
        return await promise
            .catch(e => {
                promise = null
                throw e
            })
    }
}
