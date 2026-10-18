export interface Coordinates {
  latitude: number
  longitude: number
  precisao: number
  /** Momento da leitura do GPS, em ISO 8601 */
  timestamp: string
}

export type LocationErrorCode = 'NAO_SUPORTADO' | 'PERMISSAO_NEGADA' | 'INDISPONIVEL' | 'TEMPO_ESGOTADO'

export class LocationError extends Error {
  code: LocationErrorCode

  constructor(code: LocationErrorCode, message: string) {
    super(message)
    this.name = 'LocationError'
    this.code = code
  }
}

const MENSAGENS: Record<LocationErrorCode, string> = {
  NAO_SUPORTADO: 'Seu navegador não permite obter a localização.',
  PERMISSAO_NEGADA:
    'Permissão de localização negada. Ative o acesso à localização nas configurações do navegador.',
  INDISPONIVEL: 'Não foi possível obter sua localização no momento.',
  TEMPO_ESGOTADO: 'A busca pela localização demorou demais. Tente novamente.',
}

function criarErro(code: LocationErrorCode): LocationError {
  return new LocationError(code, MENSAGENS[code])
}

// Implementação web; no app nativo será trocada pelo plugin de Geolocation do Capacitor
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(criarErro('NAO_SUPORTADO'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords, timestamp }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          precisao: coords.accuracy,
          timestamp: new Date(timestamp).toISOString(),
        }),
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(criarErro('PERMISSAO_NEGADA'))
            break
          case error.TIMEOUT:
            reject(criarErro('TEMPO_ESGOTADO'))
            break
          default:
            reject(criarErro('INDISPONIVEL'))
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    )
  })
}

export const LocationService = { getCurrentPosition }
