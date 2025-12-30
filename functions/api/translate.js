export async function onRequestPost(context) {
    const formData = await context.request.formData();
    const file = formData.get('file');

    // These must match the Variable Names you saved in Cloudflare Settings
    const KEY = context.env.AZURE_TRANSLATOR_KEY;
    const ENDPOINT = context.env.AZURE_TRANSLATOR_ENDPOINT;
    const REGION = context.env.AZURE_TRANSLATOR_REGION;

    // Construct the correct Synchronous Document Translation URL
    // targetLanguage=ur for Urdu translation
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
            const errorData = await response.text();
            return new Response(`Azure API Error: ${errorData}`, { status: response.status });
        }

        // Return the binary PDF stream directly back to the user's browser
        const translatedPdfBuffer = await response.arrayBuffer();
        return new Response(translatedPdfBuffer, {
            headers: { 'Content-Type': 'application/pdf' }
        });

    } catch (err) {
        return new Response(`Server Error: ${err.message}`, { status: 500 });
    }
}
