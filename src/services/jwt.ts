export const getUserFromToken = (token: string) => {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // JWT usa base64url, não base64 padrão
    // Converter base64url para base64 antes de decodificar
    const payload = parts[1]
      .replaceAll('-', '+')  // Substituir - por +
      .replaceAll('_', '/'); // Substituir _ por /
    
    // Adicionar padding se necessário
    const padding = payload.length % 4;
    const base64 = padding ? payload + '='.repeat(4 - padding) : payload;
    
    // Decodificar base64
    const decoded = atob(base64);
    
    // Tratar UTF-8 corretamente
    const utf8Decoded = decodeURIComponent(
      decoded.split('').map(c => {
        const codePoint = c.codePointAt(0) || 0;
        return '%' + ('00' + codePoint.toString(16)).slice(-2);
      }).join('')
    );
    
    return JSON.parse(utf8Decoded);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};
