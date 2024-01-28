export function getFileName(url) {
    // Parse the URL
    const parsedUrl = new URL(url);

    // Extract the pathname
    const path = parsedUrl.pathname;

    // Split the path by slashes
    const pathSegments = path.split("/");

    // Get the part after the second slash
    const desiredPath = pathSegments.slice(2).join("/");

    return desiredPath;
}
