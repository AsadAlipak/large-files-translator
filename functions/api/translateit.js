export async function onRequestPost(context) {
    const formData = await context.request.formData();
    const file = formData.get('file');
    const API_KEY = context.env.GOOGLE_API_KEY;
    const PROJECT_ID = context.env.GOOGLE_PROJECT_ID;

    const googleUrl = `https://translation.googleapis.com/v3/projects/${PROJECT_ID}/locations/us-central1:translateDocument?key=${API_KEY}`;

    const pdfBuffer = await file.arrayBuffer();
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    const response = await fetch(googleUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "target_language_code": "ur",
            "document_input_config": {
                "content": base64Content,
                "mime_type": "application/pdf"
            }
        })
    });

    const data = await response.json();
    const translatedB64 = data.document_translation.byte_stream_outputs[0];
    
    const binary = atob(translatedB64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    return new Response(bytes, { headers: { 'Content-Type': 'application/pdf' } });
}
