type JobHandler = (documentId: string, filePath: string) => Promise<void>;

interface Job {
  documentId: string;
  filePath: string;
}

class DocumentQueue {
  private queue: Job[] = [];
  private processing = false;
  private handler: JobHandler | null = null;

  setHandler(handler: JobHandler): void {
    this.handler = handler;
  }

  async add(documentId: string, filePath: string): Promise<void> {
    this.queue.push({ documentId, filePath });
    console.log(`📎 Job adicionado à fila: ${documentId}`);
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const job = this.queue.shift()!;
    
    try {
      console.log(`⚙️ Processando job: ${job.documentId}`);
      await this.handler!(job.documentId, job.filePath);
      console.log(`✅ Job concluído: ${job.documentId}`);
    } catch (error) {
      console.error(`❌ Erro no job ${job.documentId}:`, error);
    } finally {
      this.processing = false;
      this.processNext();
    }
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

export const documentQueue = new DocumentQueue();