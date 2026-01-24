import { api } from './api.service';

export interface File {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy?: string;
  createdAt: string;
}

export interface UploadFileResponse {
  id: string;
  originalName: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  type?: string;
  description?: string;
}

/**
 * 📁 SERVIÇO DE FILES
 * Gerencia upload e download de arquivos
 */
export class FilesService {
  /**
   * Upload de arquivo
   */
  async upload(
    file: File, 
    type?: string, 
    description?: string
  ): Promise<{ success: boolean; data?: UploadFileResponse; error?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const params: Record<string, string> = {};
      if (type) params.type = type;
      if (description) params.description = description;

      const response = await api.post<UploadFileResponse>(
        `/files/upload${Object.keys(params).length > 0 ? '?' + new URLSearchParams(params).toString() : ''}`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          showLoader: true,
        }
      );

      // O backend já retorna no formato correto
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro ao fazer upload do arquivo',
      };
    }
  }

  /**
   * Buscar arquivo por ID
   */
  async getById(id: string) {
    return api.get<File>(`/files/${id}`);
  }

  /**
   * Deletar arquivo
   */
  async delete(id: string) {
    return api.delete(`/files/${id}`);
  }

  /**
   * Download de arquivo (retorna URL)
   */
  getDownloadUrl(id: string): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return `${baseUrl}/files/${id}/download`;
  }
}

export const filesService = new FilesService();
