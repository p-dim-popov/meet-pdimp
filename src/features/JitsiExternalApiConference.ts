export class JitsiExternalApiConference {
    listeners = new Map<string, Function>();

    private _resolvedPromiseData: any;
    private _promise?: Promise<any>|null;
    private _instance: any;
    private readonly _id: string;

    constructor(id: string) {
        this._id = id;
        const jitsiMeetDiv = document.createElement('div') as HTMLDivElement;
        jitsiMeetDiv.id = id;
        jitsiMeetDiv.style.width = '100vw';
        jitsiMeetDiv.style.height = '100vh';
        jitsiMeetDiv.style.maxWidth = '100%';
        jitsiMeetDiv.style.overflow = "hidden";
        document.body.appendChild(jitsiMeetDiv);

        window.pdimp[id] = this;
    }

    get id() {
        return this._id;
    }

    setPromise = (promise: Promise<any>) => {
        this._promise = promise.then((r) => {
            this._resolvedPromiseData = r;
            this._promise = null;
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

    dispose = async () => {
        await this._instance.dispose();
        this.listeners.forEach((handler, eventName) => {
            this._instance.removeEventListener(eventName, handler);
        })
        document.getElementById(this.id)?.remove();
    }
}

export const JitsiExternalApiConferences: JitsiExternalApiConference[] = new Array<JitsiExternalApiConference>();

window.pdimp.JitsiExternalApiConferences = JitsiExternalApiConferences;
