export type EnderecoViaCep = {
  zipCode: string
  address: string
  city: string
  state: string
}

/**
 * Busca logradouro, cidade e UF pelo CEP (ViaCEP público).
 * Retorna null se CEP inválido, não encontrado ou erro de rede.
 */
export async function lookupCep(
  cepDigits: string,
): Promise<EnderecoViaCep | null> {
  const clean = cepDigits.replace(/\D/g, '')
  if (clean.length !== 8) return null
  try {
    const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    const data = (await response.json()) as {
      erro?: boolean
      logradouro?: string
      localidade?: string
      uf?: string
    }
    if (data.erro) return null
    return {
      zipCode: clean.replace(/(\d{5})(\d{3})/, '$1-$2'),
      address: data.logradouro || '',
      city: data.localidade || '',
      state: data.uf || '',
    }
  } catch {
    return null
  }
}
