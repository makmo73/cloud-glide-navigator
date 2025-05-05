
interface ElectronAPI {
  selectDirectory: () => Promise<string | null>;
  readDirectory: (dirPath: string) => Promise<Array<{ name: string, isDirectory: boolean }>>;
  platform: string;
}

interface Window {
  electron: ElectronAPI;
}
