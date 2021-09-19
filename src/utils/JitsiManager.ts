import {jsonPLoader} from "./JsonPLoader";

class JitsiManagerClass {
    // @ts-ignore
    ExternalApiClass: typeof JitsiExternalAPI;
    async loadExternalApi() {
        await jsonPLoader.load('https://beta.meet.jit.si/external_api.js');
        // @ts-ignore
        this.ExternalApiClass = window.JitsiMeetExternalAPI;
        // @ts-ignore
        delete window.JitsiMeetExternalAPI;
        console.log('[JitsiMeetExternalAPI]: Loaded!')
    }
}

export const JitsiManager = new JitsiManagerClass();