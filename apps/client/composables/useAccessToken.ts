export const useAccessToken = () => {
  if (!process.client) return undefined;

  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) return undefined;

  const payload = parseJwt(accessToken);

  if (payload?.sub && new Date(payload.exp * 1000) > new Date()) {
    return accessToken;
  } else {
    return undefined;
  }
};

// Function to parse a JWT token
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return {};
  }
}