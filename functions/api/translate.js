export async function onRequestPost(context) {
    const formData = await context.request.formData();
    const file = formData.get('file');

    // These variables must match the names you saved in Cloudflare "Variables and Secrets"
    const KEY = context.env.AZURE_TRANSLATOR_KEY;
    const ENDPOINT = context.env.AZURE_TRANSLATOR_ENDPOINT;
    const REGION = context.env.AZURE_TRANSLATOR_REGION;

    // The Synchronous Translation URL for Azure (Version 2024-05-01)
    // targetLanguage=ur tells Azure to translate into Urdu
    const azureUrl = `${ENDPOINT}/translator/document:translate?targetLanguage=ur&api-version=2024-05-01`;

    // Azure requires the file to be sent in a Multi-part FormData body with the key "document"
    const azureFormData = new FormData();
    azureFormData.append('document', file);

    try {
        const response = await fetch(azureUrl, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': KEY,
                'Ocp-Apim-Subscription-Region': REGION
            },
            body: azureFormData
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(`Azure API Error: ${errorText}`, { status: response.status });
        }

        // Returns the binary PDF stream back to your browser
        const translatedPdfBuffer = await response.arrayBuffer();
        return new Response(translatedPdfBuffer, {
            headers: { 'Content-Type': 'application/pdf' }
        });

    } catch (err) {
        return new Response(`Internal Server Error: ${err.message}`, { status: 500 });
    }
}
