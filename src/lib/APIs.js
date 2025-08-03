export async function getRandomPlaylist(serverURL, accessToken) {
  if (serverURL.length == 0) {
    return { error: "Server URL is empty" };
  }
  if (accessToken.length == 0) {
    return { error: "Access Token is empty" };
  }
  const endpoint = `${serverURL}/randomPlaylist?length=50`;
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: accessToken,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return { data, error: null };
    } else if (response.status == 401) {
      console.error("Error response:", response);
      return { error: "Incorrect server URL or token." };
    } else {
      console.error("Error response:", response);
      return { error: "Unexpected error. Check server!" };
    }
  } catch (error) {
    return { error: "Could not connect! Check Internet connection." };
  }
}
