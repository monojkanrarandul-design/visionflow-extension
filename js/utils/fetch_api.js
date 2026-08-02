export default async function apiRequest({url, method = "GET", data = null, headers = {}}) {
    const options = {
        method,
        headers: {
            ...headers,
        },
    };

    if (data !== null) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}