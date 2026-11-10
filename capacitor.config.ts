import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // Identificador do app nas lojas. É PERMANENTE depois da primeira publicação:
  // troque pelo seu domínio invertido (ex.: br.com.seudominio.app) antes de enviar.
  appId: 'com.fitflowpro.app',
  appName: 'FitFlow Pro',
  webDir: 'dist',
  backgroundColor: '#0E0F0C',
  android: { backgroundColor: '#0E0F0C' },
}

export default config
