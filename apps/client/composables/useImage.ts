const objectUrl = (blob: Blob): string | null => {
  if (!blob) return null;

  try {
    const url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error("Error creating object URL:", error);
    return null;
  }
};

export const useImage = (url_: string) => {
  const { loading, execute } = useApi<Blob>(
    url_,
    undefined,
    { responseType: "blob" },
    false
  );
  const url = useState<string>("avatar_url");

  if (!url.value)
    execute().then((data) => {
      const urlObject = objectUrl(data!)!;
      url.value = urlObject;
    });

  return { loading, url };
};
