export const useDownloadFile = (initialUrl: string = '', initialFileName: string = 'file') => {
  const { loading, execute } = useApi<Blob>(
    initialUrl,
    undefined,
    { responseType: 'blob' },
    false
  );

  const download = async (url?: string, fileName?: string): Promise<void> => {
    if (!loading.value) {
      try {
        const blob = await execute(url || initialUrl);
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName || initialFileName;
          a.style.display = 'none';

          document.body.appendChild(a);
          a.click();

          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  };

  return { loading, download };
};

// Example usage:
const { loading, download } = useDownloadFile('https://example.com/somefile.pdf', 'example.pdf');

// To download a different URL with a different fileName dynamically, call download with the new URL and fileName:
// download('https://example.com/anotherfile.pdf', 'newfile.pdf');
