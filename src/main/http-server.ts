import http, { IncomingMessage, ServerResponse, Server } from 'http';
import { BrowserWindow } from 'electron';
import { TucaoData } from '../types/tucao_data'; // Adjust the import path as necessary

export default class AudioHttpServer {
  private port: number;
  private server: Server | null = null;
  private mainWindow: BrowserWindow;

  constructor(port: number = 13001, mainWindow: BrowserWindow) {
    this.port = port;
    this.mainWindow = mainWindow;
    this.server = null;
  }

  init(): void {
    this.server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
      try {
        if (req.method === 'POST' && req.url === '/play_tucao') {
          const task = await this.parseRequestBody(req);
          this.mainWindow.webContents.send('play-tucao', task);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'success', message: 'Tucao task received' }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not Found' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (error as Error).message }));
      }
    });
    this.server.listen(this.port, () => {
      console.log(`Audio HTTP server is running on port ${this.port}`);
    });
    // 添加错误处理
    this.server.on('error', (err) => {
      console.error('HTTP server error:', err);
    });

    // 添加客户端连接处理
    this.server.on('connection', (socket) => {
      console.log('New client connected');
      socket.on('close', () => console.log('Client disconnected'));
    });
  }

  private parseRequestBody(req: IncomingMessage): Promise<TucaoData> {
    return new Promise((resolve, reject) => {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body) as TucaoData;
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON format'));
        }
      });
      // 添加请求超时处理
      req.on('error', (err) => {
        reject(new Error(`Request error: ${err.message}`));
      });
    });
  }

  close(): void {
    if (this.server) {
      this.server.close(() => {
        console.log('Audio HTTP server closed');
      });
      this.server = null;
    }
  }
}
