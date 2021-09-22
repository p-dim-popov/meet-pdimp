export async function copyPlaintext(text: string): Promise<boolean> {
    try {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";

            document.body.appendChild(textArea);
            const selection = document.getSelection();
            const range = document.createRange();

            range.selectNode(textArea);

            if (!selection) {
                throw new Error('Selection is undefined/null')
            }

            selection.removeAllRanges();
            selection.addRange(range);

            const successful = document.execCommand("copy");
            selection.removeAllRanges();
            document.body.removeChild(textArea);
            return successful;
        }
    } catch (e) {
        console.error("[copyPlaintext]: failed", e);
    }
    return false;
}