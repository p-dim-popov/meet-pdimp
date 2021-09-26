export class JitsiExternalApiConference {
    listeners = new Map<string, Function>();

    private _resolvedPromiseData: any;
    private _promise?: Promise<any>|null;
    private _instance: any;

    setPromise = (promise: Promise<any>) => {
        this._promise = promise.then((r) => {
            this._resolvedPromiseData = r;
            // this._promise = null;
            return this._instance;
        });
    }

    get loaded(): boolean {
        return !!this._instance && !this._promise;
    }

    get = (): Promise<any> | any  => {
        if (this._promise) {
            return this._promise;
        }

        return this._instance;
    }

    setInstance = (value: any) => {
        this._instance = value;
    }

    dispose = () => {
        this._instance.dispose();
        this.listeners.forEach((handler, eventName) => {
            this._instance.removeEventListener(eventName, handler);
        })
    }
}

export const JitsiExternalApiConferences: JitsiExternalApiConference[] = new Array<JitsiExternalApiConference>();

// @ts-ignore
window.pdimpJitsiExternalApiConferences = JitsiExternalApiConferences;
