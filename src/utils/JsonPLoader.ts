export const jsonPLoader = {
    load(url: string) {
        const script = document.createElement('script') as HTMLScriptElement;
        script.src = url;
        return new Promise((resolve, reject) => {
            script.addEventListener('load', resolve)
            script.addEventListener('error', reject)
            document.body.appendChild(script);
        });
    }
}