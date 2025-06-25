export interface TucaoData {
  audio: string;
  actions?: {
    expressions?: string[];
    pictures?: string[];
    sounds?: string[];
  };
  text: string;
  volumes?: number[];
  sliceLength?: number;
}
